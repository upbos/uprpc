package cli

import (
	"context"
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/dynamic"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"io"
)

type Metadata struct {
	Id        string `json:"id,omitempty"`
	Key       string `json:"key,omitempty"`
	Value     []byte `json:"value,omitempty"`
	ParseType int8   `json:"parseType,omitempty"`
}

type RequestData struct {
	Id               string     `json:"id,omitempty"`
	ProtoPath        string     `json:"protoPath,omitempty"`
	ServiceName      string     `json:"serviceName,omitempty"`
	ServiceFullyName string     `json:"serviceFullyName,omitempty"`
	MethodName       string     `json:"methodName,omitempty"`
	MethodMode       Mode       `json:"methodMode,omitempty"`
	Host             string     `json:"host,omitempty"`
	Body             string     `json:"body,omitempty"`
	Mds              []Metadata `json:"mds,omitempty"`
	IncludeDirs      []string   `json:"includeDirs,omitempty"`
}

type ResponseData struct {
	Id   string     `json:"id"`
	Body string     `json:"body"`
	Mds  []Metadata `json:"mds"`
}

type Mode int

const (
	Unary Mode = iota
	ClientStream
	ServerStream
	BidirectionalStream
)

type Client struct {
	ctx context.Context
}

type stream struct {
	methodMode Mode
	methodDesc *desc.MethodDescriptor
	cli        *client
	cliStream  *grpcdynamic.ClientStream
	srvStream  *grpcdynamic.ServerStream
	bidiStream *grpcdynamic.BidiStream
}

var streams = make(map[string]*stream)

func New(ctx context.Context) *Client {
	return &Client{
		ctx: ctx,
	}
}

func (c *Client) Send(req *RequestData) {
	switch req.MethodMode {
	case Unary:
		c.invokeUnary(req)
	case ClientStream:
		c.invokeClientStream(req)
	case ServerStream:
		c.invokeServerStream(req)
	case BidirectionalStream:
		c.invokeBidiStream(req)
	}
}

func (c *Client) Push(req *RequestData) {
	if stream, ok := streams[req.Id]; ok {
		methodDesc, _ := findMethodDesc(req.ProtoPath, req.ServiceFullyName, req.MethodName)
		if req.MethodMode == ClientStream {
			stream.cliStream.SendMsg(buildRequest(methodDesc, req.Body))
		}
		if req.MethodMode == BidirectionalStream {
			stream.bidiStream.SendMsg(buildRequest(methodDesc, req.Body))
		}
	}
}

func (c *Client) Stop(id string) {
	stream, ok := streams[id]
	if !ok {
		return
	}
	if stream.methodMode == ClientStream {
		if msg, err := stream.cliStream.CloseAndReceive(); err == nil {
			emitMsg(c.ctx, id, parseResponse(stream.methodDesc, &msg), parsePairs(stream.cliStream.Trailer()))
		}
	}

	if stream.methodMode == BidirectionalStream {
		_ = stream.bidiStream.CloseSend()
	}

	emitClose(c.ctx, id)
	stream.cli.close()
}

func buildContext(mds *[]Metadata) context.Context {
	md := buildPairs(*mds)
	return metadata.NewOutgoingContext(context.Background(), md)
}

func buildRequest(methodDesc *desc.MethodDescriptor, body string) *dynamic.Message {
	reqMsg := dynamic.NewMessage(methodDesc.GetInputType())
	reqMsg.UnmarshalMergeJSON([]byte(body))
	return reqMsg
}

func parseResponse(methodDesc *desc.MethodDescriptor, response *proto.Message) string {
	respMsg := dynamic.NewMessage(methodDesc.GetOutputType())
	respMsg.ConvertFrom(*response)
	byte, _ := respMsg.MarshalJSONIndent()
	return string(byte)
}

func (c *Client) invokeUnary(req *RequestData) {
	cliStub, err := createStub(req.Host)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	var trailer metadata.MD
	resp, err := cliStub.stub.InvokeRpc(buildContext(&req.Mds), methodDesc, buildRequest(methodDesc, req.Body), grpc.Trailer(&trailer))
	if err != nil {
		emitErr(c.ctx, req.Id, parsePairs(trailer), err)
		return
	}

	emitMsg(c.ctx, req.Id, parseResponse(methodDesc, &resp), nil)
	cliStub.close()
}

func (c *Client) invokeClientStream(req *RequestData) {
	cliStub, err := createStub(req.Host)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	clientStream, err := cliStub.stub.InvokeRpcClientStream(buildContext(&req.Mds), methodDesc)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	streams[req.Id] = &stream{
		methodMode: req.MethodMode,
		methodDesc: methodDesc,
		cli:        cliStub,
		cliStream:  clientStream,
	}
}

func (c *Client) invokeServerStream(req *RequestData) {
	cliStub, err := createStub(req.Host)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	srvStream, err := cliStub.stub.InvokeRpcServerStream(buildContext(&req.Mds), methodDesc, buildRequest(methodDesc, req.Body))
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	streams[req.Id] = &stream{
		methodMode: req.MethodMode,
		methodDesc: methodDesc,
		cli:        cliStub,
		srvStream:  srvStream,
	}

	go func(srvStream *grpcdynamic.ServerStream) {
		respMsg := dynamic.NewMessage(methodDesc.GetOutputType())
		for {
			respMsg.Reset()
			msg, err := srvStream.RecvMsg()
			fmt.Printf("srever stream: %v", msg)
			if err == nil {
				emitMsg(c.ctx, req.Id, parseResponse(methodDesc, &msg), nil)
				continue
			}

			if err == io.EOF {
				emitMsg(c.ctx, req.Id, parseResponse(methodDesc, &msg), parsePairs(srvStream.Trailer()))
			}
			emitClose(c.ctx, req.Id)
			cliStub.close()
			break
		}
	}(srvStream)
}

func (c *Client) stopServerStream(id string) {
	if stream, ok := streams[id]; ok {
		emitClose(c.ctx, id)
		stream.cli.close()
	}
}

func (c *Client) invokeBidiStream(req *RequestData) {
	cliStub, err := createStub(req.Host)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	bidiStream, err := cliStub.stub.InvokeRpcBidiStream(buildContext(&req.Mds), methodDesc)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		return
	}

	streams[req.Id] = &stream{
		methodMode: req.MethodMode,
		methodDesc: methodDesc,
		cli:        cliStub,
		bidiStream: bidiStream,
	}
	go func(bidiStream *grpcdynamic.BidiStream) {
		respMsg := dynamic.NewMessage(methodDesc.GetOutputType())
		for {
			respMsg.Reset()

			// block until response is received
			msg, err := bidiStream.RecvMsg()
			fmt.Printf("srever stream: %v, error: %v\n", msg, err)
			if err == nil {
				emitMsg(c.ctx, req.Id, parseResponse(methodDesc, &msg), nil)
				return
			}

			if err == io.EOF {
				emitMsg(c.ctx, req.Id, "", parsePairs(bidiStream.Trailer()))
			}
			emitClose(c.ctx, req.Id)
			cliStub.close()
		}
	}(bidiStream)
}