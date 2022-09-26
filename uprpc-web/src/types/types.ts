declare global {
    interface Window {
        rpc: any;
    }
}

export enum ParseType {
    Text = 0,
    Int8,
    Int16LE,
    Int16BE,
    Int32LE,
    Int32BE,

    FloatLE,
    FloatBE,

    DoubleLE,
    DoubleBE,

    Uint8,
    Uint16LE,
    Uint16BE,
    Uint32LE,
    Uint32BE,

    BigInt64BE,
    BigInt64LE,
    BigUint64BE,
    BigUint64LE,
}

export const parseTypeMap: Map<number, string> = new Map([
    [ParseType.Text, "Text"],
    [ParseType.Int8, "Int8"],
    [ParseType.Int16LE, "Int16LE"],
    [ParseType.Int16BE, "Int16BE"],
    [ParseType.Int32LE, "Int32LE"],
    [ParseType.Int32BE, "Int32BE"],

    [ParseType.FloatLE, "FloatLE"],
    [ParseType.FloatBE, "FloatBE"],

    [ParseType.DoubleLE, "DoubleLE"],
    [ParseType.DoubleBE, "DoubleBE"],

    [ParseType.Uint8, "UInt8"],
    [ParseType.Uint16LE, "Uint16LE"],
    [ParseType.Uint16BE, "Uint16BE"],
    [ParseType.Uint32LE, "Uint32LE"],
    [ParseType.Uint32BE, "Uint32BE"],

    [ParseType.BigInt64BE, "BigInt64BE"],
    [ParseType.BigInt64LE, "BigInt64LE"],
    [ParseType.BigUint64BE, "BigUint64BE"],
    [ParseType.BigUint64LE, "BigUint64LE"],
]);

export interface Metadata {
    id: number;
    key: string;
    value?: any;
    parseType: ParseType;
}

// 请求信息
export interface RequestData {
    id: string;
    protoPath: string;
    namespace: string;
    serviceName: string;
    methodName: string;
    methodMode: Mode;
    host: string;
    body: any;
    mds?: Metadata[];
    includeDirs?: string[];
}

// 响应信息
export interface ResponseData {
    id: string;
    body: string;
    mds?: Metadata[];
}

export enum Mode {
    Unary = 0,
    ClientStream = 1,
    ServerStream = 2,
    BidirectionalStream = 3,
}

export const modeMap = {
    [Mode.Unary]: "Unary Call",
    [Mode.ClientStream]: "Client Stream",
    [Mode.ServerStream]: "Server Stream",
    [Mode.BidirectionalStream]: "Bi-Directional",
};

export interface Method {
    id: string;
    namespace: string,
    serviceName: string,
    name: string;
    mode: Mode;
    requestBody: string;
    requestMds?: Metadata[];
    responseMds?: Metadata[];
}


export interface Proto {
    name: string;
    path: string;
    host: string;
    methods: Method[];
}

export interface RequestCache {
    streams?: string[];
}

export interface ResponseCache {
    mds?: Metadata[];
    body: string;
    streams: string[];
}

export enum TabType {
    Proto,
    Env,
}

export interface Tab {
    key: string;
    title?: string;
    type?: TabType;
    params?: any;
    dot?: boolean;
    closable?: boolean;
}
