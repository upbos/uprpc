package main

import (
	"context"
	"embed"
	"fmt"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"net/http"
	_ "net/http/pprof"
)

//go:embed frontend/dist
var assets embed.FS
var gCtx context.Context

func main() {

	go func() {
		fmt.Println("pprof start...")
		fmt.Println(http.ListenAndServe(":9020", nil))
	}()

	newApi := newApi()
	// Create application with options
	err := wails.Run(&options.App{
		Title:            "UpRpc",
		Width:            1024,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			newApi.startup(ctx)
			gCtx = ctx
		},
		Menu: createMenu(),
		Bind: []interface{}{
			newApi,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}

}
