import {makeAutoObservable} from "mobx";
import * as storage from "@/stores/localStorage";

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
        let res = yield window.rpc.openIncludeDir()
        if (res.success) {
            storage.addIncludeDir(res.data);
            this.includeDirs = storage.listIncludeDir();
        }
    }

    * removeIncludeDir(path: string) {
        storage.removeIncludeDir(path);
    }
}