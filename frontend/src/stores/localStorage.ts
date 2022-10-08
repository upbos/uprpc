import { Method, Proto } from "@/types/types";

const INCLUDE_DIRS_KEY = "includeDirs";
const PROTOS_KEY = "protos";

function getMethod(proto: Proto, serviceName: string, methodName: string): Method | null {
    for (let method of proto.methods) {
        if (serviceName == method.serviceName && method.name == methodName) {
            return method;
        }
    }

    return null;
}

export function getProto(path: string): Proto | null {
    let protos = listProto();
    for (let proto of protos) {
        if (proto.path == path) {
            return proto;
        }
    }
    return null;
}

export function listProto(): Proto[] {
    let protos = localStorage.getItem(PROTOS_KEY);
    return protos == null ? [] : JSON.parse(protos);
}

export function addProtos(protos: Proto[]): void {
    for (let proto of protos) {
        addProto(proto);
    }
}

export function addProto(proto: Proto): void {
    let localProtos = listProto();
    for (let i = 0; i < localProtos.length; i++) {
        if (localProtos[i].path === proto.path) {
            localProtos.splice(i, 1);
            break;
        }
    }
    localProtos.push(proto);
    localStorage.setItem(PROTOS_KEY, JSON.stringify(localProtos));
}

export function reloadProtos(protos: Proto[]): void {
    for (let proto of protos) {
        reloadProto(proto);
    }
}

export function reloadProto(proto: Proto): void {
    let origProto = getProto(proto.path);
    if (origProto == null) {
        return;
    }

    let mergedProto = { ...proto, host: origProto.host };
    for (let method of mergedProto.methods) {
        let origMethod = getMethod(origProto, method.serviceName, method.name);
        if (origMethod == null) {
            continue;
        }

        method.id = origMethod.id;
        method.requestMds = origMethod.requestMds;
        method.responseMds = origMethod.responseMds;

        let newParams = method.requestBody ? JSON.parse(method.requestBody) : {};
        let origParams = origMethod.requestBody ? JSON.parse(origMethod.requestBody) : {};

        for (let key in newParams) {
            if (origParams[key] != null) {
                newParams[key] = origParams[key];
            }
        }
        method.requestBody = JSON.stringify(newParams, null, "\t");
    }

    addProto(mergedProto);
}

export function removeProto(path: string): void {
    let localProtos = listProto();
    for (let i = 0; i < localProtos.length; i++) {
        if (localProtos[i].path === path) {
            localProtos.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(PROTOS_KEY, JSON.stringify(localProtos));
}

export function listMethod(protoPath: string): Method[] {
    let proto = getProto(protoPath);
    if (proto == null) return [];
    return proto.methods;
}

export function listIncludeDir(): string[] {
    let includeDirs = localStorage.getItem(INCLUDE_DIRS_KEY);
    return includeDirs == null ? [] : JSON.parse(includeDirs);
}

export function addIncludeDir(path: string): void {
    let includeDirs = listIncludeDir();
    for (let i = 0; i < includeDirs.length; i++) {
        if (includeDirs[i] === path) {
            includeDirs.splice(i, 1);
            break;
        }
    }
    includeDirs.push(path);
    localStorage.setItem(INCLUDE_DIRS_KEY, JSON.stringify(includeDirs));
}

export function removeIncludeDir(path: string): void {
    let includeDirs = listIncludeDir();
    for (let i = 0; i < includeDirs.length; i++) {
        if (includeDirs[i] === path) {
            includeDirs.splice(i, 1);
            break;
        }
    }
    localStorage.setItem(INCLUDE_DIRS_KEY, JSON.stringify(includeDirs));
}
