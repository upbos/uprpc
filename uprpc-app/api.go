package main

import (
	"context"
	"uprpc/client"
	"uprpc/proto"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Api struct {
	ctx context.Context
	cli *client.Client
}

func newApi() *Api {
	return &Api{}
}

func (api *Api) startup(ctx context.Context) {
	api.ctx = ctx
	api.cli = client.New(ctx)
}

type R struct {
	Success bool        `json:"success,omitempty"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

func (api *Api) OpenProto() R {
	return R{Success: true, Data: proto.ImportFile(api.ctx)}
}

func (api *Api) ParseProto(fileNames []string, includeDirs []string) R {
	files, err := proto.Parse(fileNames, includeDirs)
	if err != nil {
		return R{Success: false}
	} else {
		return R{Success: true, Data: files}
	}
}

func (api *Api) Send(req client.RequestData) R {
	runtime.LogPrintf(api.ctx, "%+v", req)
	api.cli.Send(&req)
	return R{Success: true, Data: nil}
}

func (api *Api) Stop(id string) R {
	api.cli.Stop(id)
	return R{Success: true, Data: nil}
}
