package main

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"uprpc/types"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// OpenProto open file dialog
func (a *App) Send(reqData types.RequestData) types.ResponseData {
	return a.Send(reqData)
}

func (p *App) ImportFile() []string {
	selection, _ := runtime.OpenMultipleFilesDialog(p.ctx, runtime.OpenDialogOptions{
		Title: "Import File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "proto (*.proto)",
				Pattern:     "*.proto",
			},
		},
	})

	return selection
}
