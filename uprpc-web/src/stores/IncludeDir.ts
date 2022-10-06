import {makeAutoObservable} from "mobx";
import * as storage from "@/stores/localStorage";
import {OpenIncludeDir} from "@/wailsjs/go/main/Api";

export default class IncludeDirStore {
    constructor() {
        console.log('init paths store')
        makeAutoObservable(this)
        this.init()
    }

    includeDirDrawerVisible = false;
    includeDirs: string[] = [];

    * init(): any {
        this.includeDirs = storage.listIncludeDir();
    }

    showIncludeDir(visible: boolean) {
        this.includeDirDrawerVisible = visible
    }

    * addIncludeDir(): any {
        let res = yield OpenIncludeDir()
        if (res.success && res.data != '') {
            storage.addIncludeDir(res.data);
            this.includeDirs = storage.listIncludeDir();
        }
    }

    * removeIncludeDir(path: string) {
        storage.removeIncludeDir(path);
        this.includeDirs = storage.listIncludeDir();
    }
}