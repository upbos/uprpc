package client

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"strings"

	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/desc/protoparse"
	"github.com/jhump/protoreflect/dynamic"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/runtime/protoiface"
)

type RequestData struct {
	Id               string      `json:"id,omitempty"`
	ProtoPath        string      `json:"protoPath,omitempty"`
	ServiceName      string      `json:"serviceName,omitempty"`
	ServiceFullyName string      `json:"serviceFullyName,omitempty"`
	MethodName       string      `json:"methodName,omitempty"`
	MethodMode       Mode        `json:"methodMode,omitempty"`
	Host             string      `json:"host,omitempty"`
	Body             string      `json:"body,omitempty"`
	Mds              interface{} `json:"mds,omitempty"`
	IncludeDirs      []string    `json:"includeDirs,omitempty"`
}

type ResponseData struct {
	Id   string      `json:"id"`
	Body string      `json:"body"`
	Mds  interface{} `json:"mds"`
}

type Mode int

const (
	Unary Mode = iota
	ClientStream
	ServerStream
	BidirectionalStream
)

type ClientStub struct {
	host      string
	stub      *grpcdynamic.Stub
	conn      *grpc.ClientConn
	proto     *desc.FileDescriptor
	call      interface{}
	write     chan interface{}
	stopRead  chan string
	stopWrite chan string
}

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
		if stub.stopRead != nil {
			stub.stopRead <- id
		}
		if stub.stopWrite != nil {
			stub.stopWrite <- id
		}
	}
}

func (c *ClientStub) Close(id string) {
	c.conn.Close()
	if c.stopRead != nil {
		close(c.stopRead)
	}
	if c.write != nil {
		close(c.write)
	}
	if c.stopWrite != nil {
		close(c.stopWrite)
	}
}

func (c *Client) returnReponse(id string, data *dynamic.Message, mds metadata.MD, err error) {
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

func (c *Client) closeStream(req *RequestData) {
	runtime.EventsEmit(c.ctx, "end", req.Id)
}

func (c *Client) createStub(req *RequestData, write chan interface{}, stopRead chan string, stopWrite chan string) (*ClientStub, error) {
	//  parse proto
	proto, err := parse(req.ProtoPath)
	handleError(req.Id, err)

	// create connect
	conn, err := grpc.Dial(req.Host, grpc.WithInsecure())
	handleError(req.Id, err)

	// create stub
	stub := grpcdynamic.NewStub(conn)

	cliStub := &ClientStub{
		host:  req.Host,
		stub:  &stub,
		conn:  conn,
		proto: proto,
	}

	if write != nil {
		cliStub.write = write
	}
	if stopRead != nil {
		cliStub.stopRead = stopRead
	}
	if stopWrite != nil {
		cliStub.stopWrite = stopWrite
	}
	c.stubs[req.Id] = cliStub
	return c.stubs[req.Id], nil
}

func (c *Client) closeStub(req *RequestData) {
	stub := c.stubs[req.Id]
	if stub != nil {
		stub.Close(req.Id)
		delete(c.stubs, req.Id)
	}
}

func (c *Client) invokeUnary(req *RequestData) *ResponseData {
	stub, err := c.createStub(req, nil, nil, nil)
	handleError(req.Id, err)

	methodDesc := stub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	// send metadata
	ctx := metadata.AppendToOutgoingContext(context.Background(), "code", "a")
	// receive metadata
	var trailer metadata.MD

	// call method
	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))
	resp, err := stub.stub.InvokeRpc(ctx, methodDesc, reqMsg, grpc.Trailer(&trailer))
	handleError(req.Id, err)

	respMsg := dynamic.NewMessage(respDesc)
	respMsg.ConvertFrom(resp)
	log.Printf("resp :%s %s ", respMsg, trailer)
	c.returnReponse(req.Id, respMsg, trailer, nil)
	c.closeStub(req)
	return nil
}

func (c *Client) invokeServerStream(req *RequestData) *ResponseData {
	stub, err := c.createStub(req, nil, make(chan string, 1), nil)
	handleError(req.Id, err)

	methodDesc := stub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	// call method
	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))
	serverStream, err := stub.stub.InvokeRpcServerStream(context.Background(), methodDesc, reqMsg)
	handleError(req.Id, err)

	go c.readStream(serverStream, respDesc, req)
	return nil
}

func (c *Client) invokeClientStream(req *RequestData) *ResponseData {
	stub, err := c.createStub(req, make(chan interface{}, 1), nil, make(chan string, 1))
	handleError(req.Id, err)

	methodDesc := stub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if stub.call != nil {
		stub.write <- reqMsg
		return nil
	}

	// create new call for method
	clientStream, err := stub.stub.InvokeRpcClientStream(context.Background(), methodDesc)
	handleError(req.Id, err)

	// cache clientStream
	stub.call = clientStream
	go c.writeStream(clientStream, respDesc, req)

	stub.write <- reqMsg
	return nil

}

func (c *Client) invokeBidirectionalStream(req *RequestData) *ResponseData {
	stub, err := c.createStub(req, make(chan interface{}, 1), make(chan string, 1), make(chan string, 1))
	handleError(req.Id, err)

	methodDesc := stub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if stub.call != nil {
		stub.write <- reqMsg
		return nil
	}

	// create new call for method
	bidiStream, err := stub.stub.InvokeRpcBidiStream(context.Background(), methodDesc)
	handleError(req.Id, err)

	// cache clientStream
	stub.call = bidiStream
	go c.readStream(bidiStream, respDesc, req)
	go c.writeStream(bidiStream, respDesc, req)

	stub.write <- reqMsg
	return nil
}

func (c *Client) readStream(stream interface{}, respDesc *desc.MessageDescriptor, req *RequestData) {
	respMsg := dynamic.NewMessage(respDesc)
	serverStream, isServerStream := stream.(*grpcdynamic.ServerStream)
	bidiStream, isBidiStream := stream.(*grpcdynamic.BidiStream)
	stub := c.stubs[req.Id]
	for {
		respMsg.Reset()
		select {
		case id := <-stub.stopRead:
			if req.Id != id {
				continue
			}
			if isBidiStream {
				err := bidiStream.CloseSend()
				handleError(req.Id, err)
				c.returnReponse(req.Id, nil, bidiStream.Trailer(), nil)
			}
			c.closeStream(req)
			return
		default:
			var msg protoiface.MessageV1
			var err error
			if isServerStream {
				msg, err = serverStream.RecvMsg()
				if err == io.EOF {
					c.returnReponse(req.Id, nil, serverStream.Trailer(), nil)
					return
				}
			}
			if isBidiStream {
				msg, err = bidiStream.RecvMsg()
				if err == io.EOF {
					c.returnReponse(req.Id, nil, bidiStream.Trailer(), nil)
					return
				}
			}

			handleError(req.Id, err)
			respMsg.ConvertFrom(msg)
			c.returnReponse(req.Id, respMsg, nil, nil)
		}
	}
}

func (c *Client) writeStream(stream interface{}, respDesc *desc.MessageDescriptor, req *RequestData) {
	respMsg := dynamic.NewMessage(respDesc)
	clientStream, isClientStream := stream.(*grpcdynamic.ClientStream)
	bidiStream, isBidiStream := stream.(*grpcdynamic.BidiStream)
	stub := c.stubs[req.Id]
	for {
		respMsg.Reset()

		select {
		case id := <-stub.stopWrite:
			if req.Id != id {
				continue
			}

			if isClientStream {
				msg, err := clientStream.CloseAndReceive()
				handleError(req.Id, err)
				respMsg.ConvertFrom(msg)
				c.returnReponse(req.Id, respMsg, clientStream.Trailer(), nil)
			}

			if isBidiStream {
				err := bidiStream.CloseSend()
				handleError(req.Id, err)
				c.returnReponse(req.Id, nil, bidiStream.Trailer(), nil)
			}
			c.closeStream(req)
			return
		case reqData := <-stub.write:
			if isClientStream {
				err := clientStream.SendMsg(reqData.(protoiface.MessageV1))
				handleError(req.Id, err)
			}
			if isBidiStream {
				err := bidiStream.SendMsg(reqData.(protoiface.MessageV1))
				handleError(req.Id, err)
			}
		}
	}
}

func handleError(id string, err error) {
	if err != nil {
		log.Panic(id + "@@" + err.Error())
	}
}

func (c *Client) recovery() {
	err := recover()
	if err != nil {
		log.Printf("Recovery:%s", err)
		if idx := strings.Index(err.(string), "@@"); idx != -1 {
			c.returnReponse(err.(string)[:idx], nil, nil, errors.New(err.(string)[idx+2:]))
			return
		} else {
			panic(err)
		}
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
