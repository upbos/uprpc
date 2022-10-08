package main

import (
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	rt "github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"runtime"
)

func createMenu() *menu.Menu {
	appMenu := menu.NewMenu()
	FileMenu := appMenu.AddSubmenu("File")
	FileMenu.AddText("About UpRpc", nil, func(_ *menu.CallbackData) {
		rt.EventsEmit(gCtx, "about", true)
	})
	FileMenu.AddSeparator()
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		os.Exit(0)
	})

	if runtime.GOOS == "darwin" {
		appMenu.Append(menu.EditMenu()) // on macos platform, we should append EditMenu to enable Cmd+C,Cmd+V,Cmd+Z... shortcut
	}
	return appMenu
}
