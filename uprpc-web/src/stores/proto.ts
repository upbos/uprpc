import { makeAutoObservable } from "mobx";
import { Method, Mode, Proto, RequestCache, RequestData, ResponseCache, ResponseData } from "@/types/types";
import * as storage from "./localStorage";
import { OpenProto, ParseProto, Push, Send, Stop } from "@/wailsjs/go/main/Api";
import { cli } from "@/wailsjs/go/models";
import { EventsOn } from "@/wailsjs/runtime";
import { req } from "pino-std-serializers";

export default class ProtoStore {
    constructor() {
        console.log("init rpc store");
        makeAutoObservable(this);
        this.init();
    }

    protos: Proto[] = [];
    requestCaches: Map<string, RequestCache> = new Map<string, RequestCache>();
    responseCaches: Map<string, ResponseCache> = new Map<string, ResponseCache>();
    runningCaches: Map<string, boolean> = new Map<string, boolean>();

    init(): void {
        this.initProto();
        this.onEndStream();
        this.onResponse();
    }

    initProto(): void {
        this.protos = storage.listProto();
    }

    onEndStream() {
        EventsOn("end", (methodId: string) => {
            console.log("end data: ", methodId);
            this.runningCaches.set(methodId, false);
        });
    }

    onResponse() {
        EventsOn("data", (value: any) => {
            console.log("Response data: ", value);
            let responseCache = this.responseCaches.get(value.id);
            if (responseCache == null) {
                this.responseCaches.set(value.id, {
                    body: value.body,
                    mds: value.mds,
                    streams: [value.body],
                });
                return;
            }
            // 对响应流处理
            let streams = responseCache.streams;
            if (streams == null) return;
            streams.unshift(value.body);
            this.responseCaches.set(value.id, { ...responseCache, streams: streams, mds: value.mds });
        });
    }

    *importProto(): any {
        let res = yield OpenProto();
        if (!res.success || res.data == null || res.data.length == 0) return { success: true };

        res = yield ParseProto(res.data, storage.listIncludeDir());
        storage.addProtos(res.data);
        this.initProto();
        return { success: true };
    }

    *reloadProto(): any {
        let paths: string[] = [];
        storage.listProto().forEach((value) => paths.push(value.path));
        let res = yield ParseProto(paths, storage.listIncludeDir());
        if (!res.success) {
            console.log("reload proto error");
            return;
        }
        storage.reloadProtos(res.data);
        this.initProto();
    }

    *deleteProto(id: string): any {
        storage.removeProto(id);
        this.initProto();
    }

    *saveProto(proto: Proto, host: string, method: Method) {
        console.log("save proto method", method);
        let origProto = storage.getProto(proto.path);
        if (origProto == null) return;
        origProto.host = host;
        for (let i = 0; i < origProto.methods.length; i++) {
            let origMethod = origProto.methods[i];
            if (origMethod.id == method.id) {
                origProto.methods[i] = method;
            }
        }
        storage.addProto(origProto);
        this.initProto();
    }

    *send(requestData: RequestData): any {
        this.removeCache(requestData.id);
        if (requestData.methodMode != Mode.Unary) {
            this.runningCaches.set(requestData.id, true);
        }
        yield this.push(requestData, false);
    }

    *push(requestData: RequestData, isPush: boolean): any {
        let requestCache = this.requestCaches.get(requestData.id);
        if (requestCache == null) {
            this.requestCaches.set(requestData.id, { streams: [requestData.body] });
        } else {
            let streams = requestCache.streams;
            streams?.unshift(requestData.body);
            this.requestCaches.set(requestData.id, { streams: streams });
        }
        requestData.includeDirs = storage.listIncludeDir();
        if (isPush) {
            yield Push(new cli.RequestData(requestData));
        } else {
            console.log("send request data", requestData);
            yield Send(new cli.RequestData(requestData));
        }
    }

    *removeCache(methodId: string): any {
        // 清空缓存
        this.requestCaches.delete(methodId);
        this.responseCaches.delete(methodId);
        this.runningCaches.delete(methodId);
    }

    *stopStream(methodId: string) {
        console.log("request stop stream");
        yield Stop(methodId);
        this.runningCaches.set(methodId, false);
    }
}
