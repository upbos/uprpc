package cli

import (
	"context"
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/jhump/protoreflect/desc/protoparse"
	"github.com/jhump/protoreflect/dynamic"
	"google.golang.org/grpc/metadata"
	"time"

	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
)

type clientStub struct {
	id         string
	conn       *grpc.ClientConn
	stub       *grpcdynamic.Stub
	file       *desc.FileDescriptor
	methodMode Mode
	cliMsg     chan proto.Message
	cliStop    chan bool
	srvStop    chan bool
}

var stubs = map[string]*clientStub{}

func createStub(req *RequestData) (*clientStub, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*1)
	defer cancel()
	// create connect
	conn, err := grpc.DialContext(ctx, req.Host, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		return nil, errors.Wrap(err, "connect server error")
	}

	//  parse proto
	file, err := parse(req.ProtoPath)
	if err != nil {
		return nil, errors.Wrap(err, "parse proto error")
	}

	// create stub
	stub := grpcdynamic.NewStub(conn)
	cliStub := &clientStub{
		id:         req.Id,
		conn:       conn,
		stub:       &stub,
		file:       file,
		methodMode: req.MethodMode,
	}
	switch req.MethodMode {
	case ClientStream:
		cliStub.cliMsg = make(chan proto.Message)
		cliStub.cliStop = make(chan bool)
	case ServerStream:
		cliStub.srvStop = make(chan bool)
	case BidirectionalStream:
		cliStub.cliMsg = make(chan proto.Message)
		cliStub.cliStop = make(chan bool)
		cliStub.srvStop = make(chan bool)
	}
	stubs[req.Id] = cliStub
	return cliStub, nil
}

func (cs *clientStub) InvokeUnary(req *RequestData) (string, []Metadata, error) {
	methodDesc := cs.file.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	var trailer metadata.MD
	resp, err := cs.stub.InvokeRpc(buildContext(&req.Mds), methodDesc, buildRequest(methodDesc, req.Body), grpc.Trailer(&trailer))
	if err != nil {
		return "", ParseMd(trailer), err
	}
	respMsg := dynamic.NewMessage(methodDesc.GetOutputType())
	return parseResponse(respMsg, &resp), nil, nil
}

func (cs *clientStub) invokeClientStream(req *RequestData) (*grpcdynamic.ClientStream, error) {
	methodDesc := cs.file.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	clientStream, err := cs.stub.InvokeRpcClientStream(buildContext(&req.Mds), methodDesc)
	if err != nil {
		return nil, err
	}
	return clientStream, nil
}

func (cs *clientStub) InvokeServerStream(req *RequestData) (*grpcdynamic.ServerStream, error) {
	methodDesc := cs.file.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	serverStream, err := cs.stub.InvokeRpcServerStream(buildContext(&req.Mds), methodDesc, buildRequest(methodDesc, req.Body))
	if err != nil {
		return nil, err
	}
	return serverStream, nil
}

func (cs *clientStub) InvokeBidirectionalStream(req *RequestData) (*grpcdynamic.BidiStream, error) {
	methodDesc := cs.file.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	bidiStream, err := cs.stub.InvokeRpcBidiStream(buildContext(&req.Mds), methodDesc)
	if err != nil {
		return nil, err
	}
	return bidiStream, nil
}

func (cs *clientStub) getResponseMessage(serviceFullyName string, name string) *dynamic.Message {
	methodDesc := cs.file.FindService(serviceFullyName).FindMethodByName(name)
	return dynamic.NewMessage(methodDesc.GetOutputType())
}

func (cs *clientStub) parseResponse(message *dynamic.Message, response *proto.Message) string {
	message.ConvertFrom(*response)
	byte, _ := message.MarshalJSONIndent()
	return string(byte)
}

func (cs *clientStub) close() {
	fmt.Printf("close stub, id: %v\n", cs.id)
	if cs.cliStop != nil {
		close(cs.cliStop)
	}
	if cs.cliMsg != nil {
		close(cs.cliMsg)
	}
	if cs.srvStop != nil {
		close(cs.srvStop)
	}
	
	cs.conn.Close()
	delete(stubs, cs.id)
}

func buildContext(mds *[]Metadata) context.Context {
	md := ParseMds(*mds)
	return metadata.NewOutgoingContext(context.Background(), md)
}

func buildRequest(methodDesc *desc.MethodDescriptor, body string) *dynamic.Message {
	reqMsg := dynamic.NewMessage(methodDesc.GetInputType())
	reqMsg.UnmarshalMergeJSON([]byte(body))
	return reqMsg
}

func parseResponse(message *dynamic.Message, response *proto.Message) string {
	message.ConvertFrom(*response)
	byte, _ := message.MarshalJSONIndent()
	return string(byte)
}

func parse(path string) (*desc.FileDescriptor, error) {
	p := protoparse.Parser{}

	protoDesc, err := p.ParseFiles(path)
	if err != nil {
		fmt.Printf("parse proto file failed, err = %s", err.Error())
		return nil, err
	}
	return protoDesc[0], nil
}
