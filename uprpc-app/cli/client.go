package cli

import (
	"context"
	"fmt"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"

	"io"
	"runtime"
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

func New(ctx context.Context) *Client {
	return &Client{
		ctx: ctx,
	}
}

func (c *Client) Stop(id string) {
	stub, ok := stubs[id]
	if !ok {
		return
	}
	fmt.Printf("stop stream: %+v", stub)

	switch stub.methodMode {
	case ClientStream:
		stub.cliStop <- true
	case ServerStream:
		stub.srvStop <- true
	case BidirectionalStream:
		stub.cliStop <- true
		stub.srvStop <- true
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
		c.invokeBidirectionalStream(req)
	}
}

func (c *Client) Push(req *RequestData) {
	stub, ok := stubs[req.Id]
	if !ok {
		return
	}
	methodDesc := stub.file.FindService(req.ServiceFullyName).FindMethodByName(req.MethodName)
	stub.cliMsg <- buildRequest(methodDesc, req.Body)
}

func (c *Client) invokeUnary(req *RequestData) {
	cliStub, err := createStub(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", nil, err)
		return
	}

	resp, mds, err := cliStub.InvokeUnary(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", mds, err)
		return
	}
	emitResponse(c.ctx, req.Id, resp, mds, nil)
	cliStub.close()
}

func (c *Client) invokeClientStream(req *RequestData) {
	cliStub, err := createStub(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", nil, err)
		return
	}
	clientStream, err := cliStub.invokeClientStream(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", nil, err)
		emitClose(c.ctx, req)
		cliStub.close()
		return
	}

	go func(clientStream *grpcdynamic.ClientStream) {
		respMsg := cliStub.getResponseMessage(req.ServiceFullyName, req.MethodName)
		for {
			respMsg.Reset()
			select {
			case <-stubs[req.Id].cliStop:
				if msg, err := clientStream.CloseAndReceive(); err == nil {
					emitResponse(c.ctx, req.Id, cliStub.parseResponse(respMsg, &msg), ParseMd(clientStream.Trailer()), nil)
					emitClose(c.ctx, req)
					runtime.Goexit()
				}
				fmt.Printf("close client write stream failed: %v", err)
			case data := <-stubs[req.Id].cliMsg:
				fmt.Printf("client push data: %+v", data)
				clientStream.SendMsg(data)
			}
		}
	}(clientStream)

}

func (c *Client) invokeServerStream(req *RequestData) {
	cliStub, err := createStub(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", nil, err)
		return
	}
	// call method
	serverStream, err := cliStub.InvokeServerStream(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", nil, err)
		emitClose(c.ctx, req)
		cliStub.close()
		return
	}

	go func(serverStream *grpcdynamic.ServerStream) {
		respMsg := cliStub.getResponseMessage(req.ServiceFullyName, req.MethodName)
		for {
			respMsg.Reset()
			select {
			case <-stubs[req.Id].srvStop:
				runtime.Goexit()
			default:
				msg, err := serverStream.RecvMsg()
				fmt.Printf("srever stream: %v", msg)
				if err == io.EOF {
					emitResponse(c.ctx, req.Id, "", ParseMd(serverStream.Trailer()), nil)
					emitClose(c.ctx, req)
					cliStub.close()
					return
				}
				emitResponse(c.ctx, req.Id, cliStub.parseResponse(respMsg, &msg), nil, nil)
			}
		}
	}(serverStream)
}

func (c *Client) invokeBidirectionalStream(req *RequestData) {
	cliStub, err := createStub(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", nil, err)
		return
	}
	// create new call for method
	bidiStream, err := cliStub.InvokeBidirectionalStream(req)
	if err != nil {
		emitResponse(c.ctx, req.Id, "", nil, err)
		emitClose(c.ctx, req)
		cliStub.close()
		return
	}

	go func(bidiStream *grpcdynamic.BidiStream) {
		respMsg := cliStub.getResponseMessage(req.ServiceFullyName, req.MethodName)
		for {
			respMsg.Reset()
			select {
			case <-stubs[req.Id].cliStop:
				if err := bidiStream.CloseSend(); err == nil {
					emitClose(c.ctx, req)
					runtime.Goexit()
				}
				fmt.Printf("close client write stream failed: %v", err)
			case data := <-stubs[req.Id].cliMsg:
				fmt.Printf("client push data: %+v", data)
				bidiStream.SendMsg(data)
			}
		}
	}(bidiStream)

	go func(bidiStream *grpcdynamic.BidiStream) {
		respMsg := cliStub.getResponseMessage(req.ServiceFullyName, req.MethodName)
		for {
			respMsg.Reset()
			select {
			case <-stubs[req.Id].srvStop:
				runtime.Goexit()
			default:
				msg, err := bidiStream.RecvMsg()
				fmt.Printf("srever stream: %v", msg)
				if err == io.EOF {
					emitResponse(c.ctx, req.Id, "", ParseMd(bidiStream.Trailer()), nil)
					emitClose(c.ctx, req)
					cliStub.close()
					return
				}
				emitResponse(c.ctx, req.Id, cliStub.parseResponse(respMsg, &msg), nil, nil)
			}
		}
	}(bidiStream)
}
