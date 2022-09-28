package client

import (
	"context"
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
	host  string
	stub  *grpcdynamic.Stub
	conn  *grpc.ClientConn
	proto *desc.FileDescriptor
	call  interface{}
}

type Client struct {
	ctx   context.Context
	stubs map[string]*ClientStub
	write chan interface{}
	stop  chan string
}

func New(ctx context.Context) *Client {
	return &Client{
		ctx:   ctx,
		stubs: make(map[string]*ClientStub),
		write: make(chan interface{}, 10),
		stop:  make(chan string, 10),
	}
}

func (c *Client) Send(req RequestData) *ResponseData {
	switch req.MethodMode {
	case Unary:
		return c.invokeUnary(req)
	case ServerStream:
		return c.invokeServerStream(req)
	case ClientStream:
		return c.invokeClientStream(req)
	case BidirectionalStream:
		return c.invokeBidirectionalStream(req)
	}
	return nil
}

func (c *Client) Stop(id string) {
	c.stop <- id
}

func (c *Client) callback(data interface{}, err error) {
	log.Printf("retrun response data: %s", data)
	runtime.EventsEmit(c.ctx, "data", data)
}

func (c *Client) createStub(req *RequestData) (*ClientStub, error) {
	key := req.ServiceFullyName
	if c.stubs[key] != nil {
		stub := c.stubs[key]
		if stub.host == req.Host {
			return c.stubs[key], nil
		}
		stub.conn.Close()
		c.stubs[key] = nil
	}

	//  parse proto
	proto, err := parse(req.ProtoPath)
	handleError(err)

	// create connect
	conn, err := grpc.Dial(req.Host, grpc.WithInsecure())
	if err != nil {
		log.Printf("call error: %s", err.Error())
		return nil, err
	}

	// create stub
	stub := grpcdynamic.NewStub(conn)

	c.stubs[key] = &ClientStub{
		host: req.Host, stub: &stub, conn: conn, proto: proto,
	}
	return c.stubs[key], nil
}

func (c *Client) invokeUnary(req RequestData) *ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

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
	if err != nil {
		log.Printf("call error: %s %s  %s", err.Error(), resp, trailer)
		return nil
	}

	respMsg := dynamic.NewMessage(respDesc)
	respMsg.ConvertFrom(resp)
	message := respMsg.GetFieldByName("message")
	log.Printf("resp :%s %s ", respMsg, trailer)
	return &ResponseData{
		Id:   req.Id,
		Body: message.(string),
		Mds:  trailer,
	}
}

func (c *Client) invokeServerStream(req RequestData) *ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

	methodDesc := stub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	// call method
	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))
	serverStream, err := stub.stub.InvokeRpcServerStream(context.Background(), methodDesc, reqMsg)
	handleError(err)

	go c.readStream(serverStream, respDesc, req.Id)
	return nil
}

func (c *Client) invokeClientStream(req RequestData) *ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

	methodDesc := stub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if stub.call != nil {
		c.write <- reqMsg
		return nil
	}

	// create new call for method
	clientStream, err := stub.stub.InvokeRpcClientStream(context.Background(), methodDesc)
	handleError(err)

	// cache clientStream
	stub.call = clientStream
	go c.writeStream(clientStream, respDesc, req.Id)

	c.write <- reqMsg
	return nil

}

func (c *Client) invokeBidirectionalStream(req RequestData) *ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

	methodDesc := stub.proto.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	// respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if stub.call != nil {
		c.write <- reqMsg
		return nil
	}

	// create new call for method
	bidiStream, err := stub.stub.InvokeRpcBidiStream(context.Background(), methodDesc)
	handleError(err)

	// cache clientStream
	stub.call = bidiStream
	// go c.readStream(bidiStream, respDesc, req.Id)
	// go c.writeStream(bidiStream, respDesc)

	c.write <- reqMsg
	return nil
}

func handleError(err error) {
	if err != nil {
		log.Panic(err)
	}
}

func (c *Client) readStream(stream *grpcdynamic.ServerStream, respDesc *desc.MessageDescriptor, reqId string) {
	respMsg := dynamic.NewMessage(respDesc)
	for {
		select {
		case id := <-c.stop:
			if reqId == id {
				return
			}
		default:
			msg, err := stream.RecvMsg()
			if err == io.EOF {
				// serverStream.Trailer()
				return
			}

			handleError(err)
			respMsg.ConvertFrom(msg)
			c.callback(respMsg, nil)
		}
	}
}

func (c *Client) writeStream(stream *grpcdynamic.ClientStream, respDesc *desc.MessageDescriptor, reqId string) {
	respMsg := dynamic.NewMessage(respDesc)
	for {
		select {
		case id := <-c.stop:
			if reqId != id {
				continue
			}

			msg, err := stream.CloseAndReceive()
			handleError(err)
			respMsg.ConvertFrom(msg)
			c.callback(respMsg, nil)
		case reqData := <-c.write:
			err := stream.SendMsg(reqData.(protoiface.MessageV1))
			handleError(err)
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
