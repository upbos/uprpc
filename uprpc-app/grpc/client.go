package app

import (
	"changeme/types"
	"context"
	"io"
	"log"

	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/dynamic"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/runtime/protoiface"
)

type ClientStub struct {
	host  string
	stub  *grpcdynamic.Stub
	conn  *grpc.ClientConn
	proto *desc.FileDescriptor
	call  interface{}
}

type Client struct {
	stubs map[string]*ClientStub
	write chan interface{}
	stop  chan string
}

func New() *Client {
	return &Client{
		stubs: make(map[string]*ClientStub),
		write: make(chan interface{}, 10),
		stop:  make(chan string, 10),
	}
}

func (c *Client) Send(req types.RequestData) types.ResponseData {
	switch req.MethodMode {
	case types.Unary:
		return c.invokeUnary(req)
	case types.ServerStream:
		return c.invokeServerStream(req)
	case types.ClientStream:
		return c.invokeClientStream(req)
	case types.BidirectionalStream:
		return c.invokeBidirectionalStream(req)
	}
	return types.ResponseData{}
}

func (c *Client) Stop(id string) {
	c.stop <- id
}

func callback(data interface{}, err error) {
	runtime.EventsEmit(context.Background(), "data", data)
}

func (c *Client) createStub(req *types.RequestData) (*ClientStub, error) {
	key := req.Namespace + "." + req.ServiceName
	if c.stubs[key] != nil {
		stub := c.stubs[key]
		if stub.host == req.Host {
			return c.stubs[key], nil
		}
		stub.conn.Close()
		c.stubs[key] = nil
	}

	//  parse proto
	proto, err := Parse(req.ProtoPath)
	handleError(err)

	// create connect
	conn, err := grpc.Dial(req.Host, grpc.WithInsecure())
	if err != nil {
		log.Printf("call error: %s", err.Error())
		return nil, err
	}

	// create stub
	stub := grpcdynamic.NewStub(conn)

	return &ClientStub{
		host: req.Host, stub: &stub, conn: conn, proto: proto,
	}, nil
}

func (c *Client) invokeUnary(req types.RequestData) types.ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

	methodDesc := stub.proto.FindService(req.Namespace + "." + req.ServiceName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	// send metadata
	reqMd := metadata.Pairs("code", "a")
	ctx := metadata.NewOutgoingContext(context.Background(), reqMd)

	// call method
	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))
	resp, err := stub.stub.InvokeRpc(ctx, methodDesc, reqMsg)
	if err != nil {
		log.Printf("call error: %s", err.Error())
		return types.ResponseData{}
	}

	respMsg := dynamic.NewMessage(respDesc)
	respMsg.ConvertFrom(resp)
	message := respMsg.GetFieldByName("message")
	log.Printf("resp:%s", respMsg)
	// resMd, ok := metadata.FromIncomingContext(ctx)

	return types.ResponseData{
		Id:   req.Id,
		Body: message.(string),
	}
}

func (c *Client) invokeServerStream(req types.RequestData) types.ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

	methodDesc := stub.proto.FindService(req.Namespace + "." + req.ServiceName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	// call method
	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))
	serverStream, err := stub.stub.InvokeRpcServerStream(context.Background(), methodDesc, reqMsg)
	handleError(err)

	go c.readStream(serverStream, respDesc, req.Id)
	return types.ResponseData{}
}

func (c *Client) invokeClientStream(req types.RequestData) types.ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

	methodDesc := stub.proto.FindService(req.Namespace + "." + req.ServiceName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if stub.call != nil {
		c.write <- reqMsg
		return types.ResponseData{}
	}

	// create new call for method
	clientStream, err := stub.stub.InvokeRpcClientStream(context.Background(), methodDesc, reqMsg)
	handleError(err)

	// cache clientStream
	stub.call = clientStream
	go c.writeStream(clientStream, respDesc)

	c.write <- reqMsg
	return types.ResponseData{}

}

func (c *Client) invokeBidirectionalStream(req types.RequestData) types.ResponseData {
	stub, err := c.createStub(&req)
	handleError(err)

	methodDesc := stub.proto.FindService(req.Namespace + "." + req.ServiceName).FindMethodByName(req.MethodName)
	reqDesc := methodDesc.GetInputType()
	respDesc := methodDesc.GetOutputType()

	reqMsg := dynamic.NewMessage(reqDesc)
	reqMsg.UnmarshalMergeJSON([]byte(req.Body))

	if stub.call != nil {
		c.write <- reqMsg
		return types.ResponseData{}
	}

	// create new call for method
	bidiStream, err := stub.stub.InvokeRpcBidiStream(context.Background(), methodDesc, reqMsg)
	handleError(err)

	// cache clientStream
	stub.call = bidiStream
	go c.readStream(bidiStream, respDesc, req.Id)
	go c.writeStream(bidiStream, respDesc)

	c.write <- reqMsg
	return types.ResponseData{}
}

func handleError(err error) {
	if err != nil {
		log.Panic(err)
	}
}

func (c *Client) readStream(stream *grpcdynamic.ServerStream, respDesc *desc.MessageDescriptor, id string) {
	respMsg := dynamic.NewMessage(respDesc)
	for {
		select {
		case id := <-c.stop:
			if id == id {
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
			callback(respMsg, nil)
		}
	}
}

func (c *Client) writeStream(stream *grpcdynamic.ClientStream, respDesc *desc.MessageDescriptor) {
	respMsg := dynamic.NewMessage(respDesc)
	for {
		select {
		case id := <-c.stop:
			if id != id {
				continue
			}

			msg, err := stream.CloseAndReceive()
			handleError(err)
			respMsg.ConvertFrom(msg)
			callback(respMsg, nil)
		case reqData := <-c.write:
			err := stream.SendMsg(reqData.(protoiface.MessageV1))
			handleError(err)
		}

	}
}
