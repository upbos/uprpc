package main

import (
	"embed"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"uprpc/api"
)

//go:embed all:frontend
var assets embed.FS

func main() {

	newApi := api.NewApi()
	// Create application with options
	err := wails.Run(&options.App{
		Title:            "UpRpc",
		Width:            1024,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        newApi.Startup,
		Bind: []interface{}{
			newApi,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
