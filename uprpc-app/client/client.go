package client

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/desc/protoparse"
	"github.com/jhump/protoreflect/dynamic"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/runtime/protoiface"
)

type Metadata struct {
	Id        int8   `json:"id,omitempty"`
	Key       string `json:"key,omitempty"`
	Value     []byte `json:"value,omomitempty"`
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
	ctx   context.Context
	stubs map[string]*ClientStub
}

func New(ctx context.Context) *Client {
	return &Client{
		ctx:   ctx,
		stubs: make(map[string]*ClientStub),
	}
}

func (c *Client) Send(req *RequestData) {
	defer c.recovery()

	switch req.MethodMode {
	case Unary:
		c.invokeUnary(req)
	case ServerStream:
		c.invokeServerStream(req)
	case ClientStream:
		c.invokeClientStream(req)
	case BidirectionalStream:
		c.invokeBidirectionalStream(req)
	}
}

func (c *Client) Stop(id string) {
	stub := c.stubs[id]
	if stub != nil {
		if stub.stop != nil {
			stub.stop <- id
		}
	}
}

func (c *Client) openStub(req *RequestData, write chan interface{}, stop chan string) *ClientStub {
	stub := c.stubs[req.Id]
	if stub == nil {
		stub, _ = CreateStub(req, write, stop)
		c.stubs[req.Id] = stub
	}
	return stub
}

func (c *Client) closeStub(cliStub *ClientStub) {
	log.Printf("close stub: %v", cliStub)
	if cliStub != nil {
		cliStub.Close()
		delete(c.stubs, cliStub.Id)
	}
}

func (c *Client) invokeUnary(req *RequestData) *ResponseData {
	cliStub := c.openStub(req, nil, nil)
	methodDesc := cliStub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	// send metadata
	md := ParseMds(req.Mds)
	ctx := metadata.NewOutgoingContext(context.Background(), md)
	// receive metadata
	var trailer metadata.MD

	// call method
	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))
	resp, err := cliStub.stub.InvokeRpc(ctx, methodDesc, reqMsg, grpc.Trailer(&trailer))
	if err != nil {
		c.emitReponse(req.Id, nil, ParseMetadata(trailer), err)
		return nil
	}

	respMsg := dynamic.NewMessage(respDesc)
	respMsg.ConvertFrom(resp)
	c.emitReponse(req.Id, respMsg, ParseMetadata(trailer), nil)
	c.closeStub(cliStub)
	return nil
}

func (c *Client) invokeServerStream(req *RequestData) *ResponseData {
	cliStub := c.openStub(req, nil, make(chan string, 1))
	methodDesc := cliStub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	// send metadata
	md := ParseMds(req.Mds)
	ctx := metadata.NewOutgoingContext(context.Background(), md)
	// call method
	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))
	serverStream, err := cliStub.stub.InvokeRpcServerStream(ctx, methodDesc, reqMsg)
	if err != nil {
		c.emitReponse(req.Id, nil, nil, err)
		c.emitClose(req)
		c.closeStub(cliStub)
		return nil
	}

	go c.readStream(cliStub, serverStream, respDesc, req)
	return nil
}

func (c *Client) invokeClientStream(req *RequestData) *ResponseData {
	cliStub := c.openStub(req, make(chan interface{}, 1), make(chan string, 1))
	methodDesc := cliStub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if cliStub.call != nil {
		cliStub.write <- reqMsg
		return nil
	}
	// send metadata
	md := ParseMds(req.Mds)
	ctx := metadata.NewOutgoingContext(context.Background(), md)
	// create new call for method
	clientStream, err := cliStub.stub.InvokeRpcClientStream(ctx, methodDesc)
	if err != nil {
		c.emitReponse(req.Id, nil, nil, err)
		c.emitClose(req)
		c.closeStub(cliStub)
		return nil
	}

	// cache clientStream
	cliStub.call = clientStream
	go c.writeStream(cliStub, clientStream, respDesc, req)

	cliStub.write <- reqMsg
	return nil

}

func (c *Client) invokeBidirectionalStream(req *RequestData) *ResponseData {
	cliStub := c.openStub(req, make(chan interface{}, 1), make(chan string, 1))
	methodDesc := cliStub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if cliStub.call != nil {
		cliStub.write <- reqMsg
		return nil
	}

	// send metadata
	md := ParseMds(req.Mds)
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	// create new call for method
	bidiStream, err := cliStub.stub.InvokeRpcBidiStream(ctx, methodDesc)
	if err != nil {
		c.emitReponse(req.Id, nil, nil, err)
		c.emitClose(req)
		c.closeStub(cliStub)
		return nil
	}

	// cache clientStream
	cliStub.call = bidiStream
	go c.readStream(cliStub, bidiStream, respDesc, req)
	go c.writeStream(cliStub, bidiStream, respDesc, req)

	cliStub.write <- reqMsg
	return nil
}

func (c *Client) readStream(cliStub *ClientStub, stream interface{}, respDesc *desc.MessageDescriptor, req *RequestData) {
	defer c.closeStub(cliStub)

	respMsg := dynamic.NewMessage(respDesc)
	serverStream, isServerStream := stream.(*grpcdynamic.ServerStream)
	bidiStream, isBidiStream := stream.(*grpcdynamic.BidiStream)

	var msg protoiface.MessageV1
	var err error
	for {
		respMsg.Reset()
		select {
		case <-cliStub.stop:
			log.Printf("start close bidi read stream: %v", req.Id)
			return
		default:
			if isServerStream {
				// block until response is received
				msg, err = serverStream.RecvMsg()
				if err == io.EOF {
					c.emitReponse(req.Id, nil, ParseMetadata(serverStream.Trailer()), nil)
					c.emitClose(req)
					return
				}
			}

			if isBidiStream && !cliStub.Closed {
				// block until response is received
				msg, err = bidiStream.RecvMsg()
				if err == io.EOF {
					c.emitReponse(req.Id, nil, ParseMetadata(bidiStream.Trailer()), nil)
					c.emitClose(req)
					return
				}
			}

			if err != nil {
				c.emitReponse(req.Id, nil, nil, err)
				c.emitClose(req)
				return
			}

			respMsg.ConvertFrom(msg)
			c.emitReponse(req.Id, respMsg, nil, nil)
		}
	}
}

func (c *Client) writeStream(cliStub *ClientStub, stream interface{}, respDesc *desc.MessageDescriptor, req *RequestData) {
	defer c.closeStub(cliStub)

	respMsg := dynamic.NewMessage(respDesc)
	clientStream, isClientStream := stream.(*grpcdynamic.ClientStream)
	bidiStream, isBidiStream := stream.(*grpcdynamic.BidiStream)

	var (
		msg protoiface.MessageV1
		err error
	)
	for {
		respMsg.Reset()
		select {
		case <-cliStub.stop:
			log.Printf("start close bidi write stream: %v", req.Id)
			if isClientStream {
				msg, err = clientStream.CloseAndReceive()
				if err != nil {
					log.Printf("close client write stream failed: %v", err)
					return
				}
				respMsg.ConvertFrom(msg)
				c.emitReponse(req.Id, respMsg, ParseMetadata(clientStream.Trailer()), nil)
				c.emitClose(req)
			}

			if isBidiStream && !cliStub.Closed {
				err = bidiStream.CloseSend()
				if err != nil {
					log.Printf("close bidi write stream failed: %v", err)
					return
				}
				c.emitClose(req)
			}
			return
		case reqData := <-cliStub.write:
			if isClientStream {
				clientStream.SendMsg(reqData.(protoiface.MessageV1))
			}
			if isBidiStream && !cliStub.Closed {
				bidiStream.SendMsg(reqData.(protoiface.MessageV1))
			}
		}
	}
}

func (c *Client) emitReponse(id string, data *dynamic.Message, mds []Metadata, err error) {
	var body string
	if data != nil {
		byte, _ := data.MarshalJSON()
		body = string(byte)
	}
	if err != nil {
		body = fmt.Sprintf("%s", err)
	}
	respData := ResponseData{
		Id:   id,
		Body: body,
		Mds:  mds,
	}
	log.Printf("retrun response data: %v", respData)
	runtime.EventsEmit(c.ctx, "data", respData)
}

func (c *Client) emitClose(req *RequestData) {
	log.Printf("retrun close data: %v", req.Id)
	runtime.EventsEmit(c.ctx, "end", req.Id)
}

func (c *Client) recovery() {
	err := recover()
	if err != nil {
		log.Printf("Recovery:%s", err)
	}
}

func parse(path string) (*desc.FileDescriptor, error) {
	p := protoparse.Parser{}

	protoDesc, err := p.ParseFiles(path)
	if err != nil {
		log.Printf("parse proto file failed, err = %s", err.Error())
		return nil, err
	}
	return protoDesc[0], nil
}
