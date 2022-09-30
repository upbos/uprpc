package client

import (
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"google.golang.org/grpc"
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

func CreateStub(req *RequestData, write chan interface{}, stopRead chan string, stopWrite chan string) (*ClientStub, error) {
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
	return cliStub, nil
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
