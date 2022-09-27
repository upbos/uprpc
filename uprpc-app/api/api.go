package api

import (
	"context"
	"uprpc/proto"
)

type Api struct {
	ctx context.Context
}

func NewApi() *Api {
	return &Api{}
}

func (api *Api) Startup(ctx context.Context) {
	api.ctx = ctx
}

type R struct {
	Success bool
	Message string
	Data    interface{}
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
