package cli

import (
	"context"
	"fmt"
	"io"
	"os"
	"path"
	"syscall"
	"uprpc/pkg/file"

	"github.com/golang/protobuf/proto"
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/desc/protoparse"
	"github.com/jhump/protoreflect/dynamic"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/runtime/protoiface"
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
	cli        *clientStub
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
	logrus.Debugf("send req: %v", req)
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
		methodDesc, _ := findMethodDesc(req.ProtoPath, req.IncludeDirs, req.ServiceFullyName, req.MethodName)
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

	close(c.ctx, id)
}

func close(ctx context.Context, id string) {
	emitClose(ctx, id)
	if stream, ok := streams[id]; ok {
		stream.cli.close()
		delete(streams, id)
	}
}

func findMethodDesc(protoPath string, includeDirs []string, serviceFullyName string, methodName string) (*desc.MethodDescriptor, error) {
	//  parse proto
	p := protoparse.Parser{}
	p.Accessor = func(filename string) (io.ReadCloser, error) {
		fmt.Printf("Accessor filename: %v \n", filename)
		lookupFile := lookupFile(filename, append(includeDirs, path.Dir(protoPath)))
		return os.OpenFile(lookupFile, syscall.O_RDONLY, 0)
	}
	protoDesc, err := p.ParseFiles(protoPath)
	if err != nil {
		return nil, err
	}
	return protoDesc[0].FindService(serviceFullyName).FindMethodByName(methodName), nil
}

func lookupFile(fileName string, includeDirs []string) string {
	for _, dir := range includeDirs {
		joinFile := path.Join(dir, fileName)
		if ok, _ := file.ExistPath(joinFile); ok {
			return joinFile
		}
	}
	return fileName
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
		emitClose(c.ctx, req.Id)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.IncludeDirs, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		cliStub.close()
		return
	}

	var trailer metadata.MD
	resp, err := cliStub.stub.InvokeRpc(buildContext(&req.Mds), methodDesc, buildRequest(methodDesc, req.Body), grpc.Trailer(&trailer))
	if err != nil {
		emitErr(c.ctx, req.Id, parsePairs(trailer), err)
		cliStub.close()
		return
	}

	emitMsg(c.ctx, req.Id, parseResponse(methodDesc, &resp), nil)
	cliStub.close()
}

func (c *Client) invokeClientStream(req *RequestData) {
	cliStub, err := createStub(req.Host)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		close(c.ctx, req.Id)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.IncludeDirs, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		close(c.ctx, req.Id)
		return
	}

	clientStream, err := cliStub.stub.InvokeRpcClientStream(buildContext(&req.Mds), methodDesc)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		close(c.ctx, req.Id)
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
		close(c.ctx, req.Id)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.IncludeDirs, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		close(c.ctx, req.Id)
		return
	}

	srvStream, err := cliStub.stub.InvokeRpcServerStream(buildContext(&req.Mds), methodDesc, buildRequest(methodDesc, req.Body))
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		close(c.ctx, req.Id)
		return
	}

	streams[req.Id] = &stream{
		methodMode: req.MethodMode,
		methodDesc: methodDesc,
		cli:        cliStub,
		srvStream:  srvStream,
	}

	go c.readStream(streams[req.Id], srvStream, req.Id)
}

func (c *Client) invokeBidiStream(req *RequestData) {
	cliStub, err := createStub(req.Host)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		emitClose(c.ctx, req.Id)
		return
	}

	methodDesc, err := findMethodDesc(req.ProtoPath, req.IncludeDirs, req.ServiceFullyName, req.MethodName)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		close(c.ctx, req.Id)
		return
	}

	bidiStream, err := cliStub.stub.InvokeRpcBidiStream(buildContext(&req.Mds), methodDesc)
	if err != nil {
		emitErr(c.ctx, req.Id, nil, err)
		close(c.ctx, req.Id)
		return
	}
	streams[req.Id] = &stream{
		methodMode: req.MethodMode,
		methodDesc: methodDesc,
		cli:        cliStub,
		bidiStream: bidiStream,
	}
	go c.readStream(streams[req.Id], bidiStream, req.Id)
	c.Push(req)
}

type recvStream interface {
	RecvMsg() (protoiface.MessageV1, error)
	Trailer() metadata.MD
}

func (c *Client) readStream(stream *stream, readStream recvStream, id string) {
	respMsg := dynamic.NewMessage(stream.methodDesc.GetOutputType())
	for {
		respMsg.Reset()
		// block until response is received
		msg, err := readStream.RecvMsg()

		fmt.Printf("srever stream: %v, error: %v\n", msg, err)
		if err == nil {
			emitMsg(c.ctx, id, parseResponse(stream.methodDesc, &msg), nil)
			continue
		}

		if err == io.EOF {
			emitMsg(c.ctx, id, parseResponse(stream.methodDesc, &msg), parsePairs(readStream.Trailer()))
			close(c.ctx, id)
			break
		}
		emitErr(c.ctx, id, nil, err)
		close(c.ctx, id)
		break
	}
}
