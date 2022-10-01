package client

import (
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
)

type ClientStub struct {
	Id        string
	host      string
	conn      *grpc.ClientConn
	stub      *grpcdynamic.Stub
	proto     *desc.FileDescriptor
	call      interface{}
	write     chan interface{}
	stopRead  chan string
	stopWrite chan string
	Closed    bool
}

func CreateStub(req *RequestData, write chan interface{}, stopRead chan string, stopWrite chan string) (*ClientStub, error) {
	//  parse proto
	proto, err := parse(req.ProtoPath)
	if err != nil {
		return nil, errors.Wrap(err, "parse proto error")
	}

	// create connect
	conn, err := grpc.Dial(req.Host, grpc.WithInsecure())
	if err != nil {
		return nil, errors.Wrap(err, "parse proto error")
	}

	// create stub
	stub := grpcdynamic.NewStub(conn)
	return &ClientStub{
		Id:        req.Id,
		host:      req.Host,
		conn:      conn,
		stub:      &stub,
		proto:     proto,
		write:     write,
		stopRead:  stopRead,
		stopWrite: stopWrite,
	}, nil
}

func (c *ClientStub) Close() {
	if c.Closed {
		return
	}

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
	c.Closed = true
}
