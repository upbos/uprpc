package cli

import (
	"context"
	"log"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func emitMsg(ctx context.Context, id string, message string, mds []Metadata) {
	respData := ResponseData{
		Id:   id,
		Body: message,
		Mds:  mds,
	}
	log.Printf("return data:%v", respData)
	runtime.EventsEmit(ctx, "data", respData)
}

func emitErr(ctx context.Context, id string, mds []Metadata, err error) {
	respData := ResponseData{
		Id:   id,
		Body: err.Error(),
		Mds:  mds,
	}
	runtime.EventsEmit(ctx, "data", respData)
}

func emitClose(ctx context.Context, id string) {
	runtime.EventsEmit(ctx, "end", id)
}
