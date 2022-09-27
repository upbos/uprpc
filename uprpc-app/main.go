package main

import (
	"embed"
	"uprpc/proto"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed all:frontend
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	parser := proto.NewParser()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "UpRpc",
		Width:            1024,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        parser.Startup,
		Bind: []interface{}{
			app,
			parser,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
