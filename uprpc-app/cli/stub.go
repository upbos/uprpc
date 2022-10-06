package cli

import (
	"context"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"time"
)

type client struct {
	stub *grpcdynamic.Stub
	conn *grpc.ClientConn
}

func createStub(host string) (*client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*1)
	defer cancel()
	// create connect
	conn, err := grpc.DialContext(ctx, host, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		return nil, errors.Wrap(err, "connect server error")
	}

	// create stub
	stub := grpcdynamic.NewStub(conn)
	client := client{
		stub: &stub,
		conn: conn,
	}
	return &client, nil
}

func (c *client) close() {
	_ = c.conn.Close()
}
