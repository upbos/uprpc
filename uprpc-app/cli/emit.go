package cli

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func emitResponse(ctx context.Context, id string, message string, mds []Metadata, err error) {
	respData := ResponseData{
		Id:   id,
		Body: message,
		Mds:  mds,
	}
	if err != nil {
		respData.Body = err.Error()
	}
	runtime.EventsEmit(ctx, "data", respData)
}

func emitClose(ctx context.Context, req *RequestData) {
	fmt.Printf("return close data: %v", req.Id)
	runtime.EventsEmit(ctx, "end", req.Id)
}
