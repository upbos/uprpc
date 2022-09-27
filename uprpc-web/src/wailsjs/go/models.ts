export namespace main {
	
	export class Metadata {
	    id?: number;
	    key?: string;
	    value?: string;
	    parseType?: number;
	
	    static createFrom(source: any = {}) {
	        return new Metadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.key = source["key"];
	        this.value = source["value"];
	        this.parseType = source["parseType"];
	    }
	}
	export class Method {
	    id?: string;
	    serviceName?: string;
	    serviceFullyName?: string;
	    name?: string;
	    mode?: number;
	    requestBody?: string;
	    requestMds?: Metadata[];
	    responseMds?: Metadata[];
	
	    static createFrom(source: any = {}) {
	        return new Method(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.serviceName = source["serviceName"];
	        this.serviceFullyName = source["serviceFullyName"];
	        this.name = source["name"];
	        this.mode = source["mode"];
	        this.requestBody = source["requestBody"];
	        this.requestMds = this.convertValues(source["requestMds"], Metadata);
	        this.responseMds = this.convertValues(source["responseMds"], Metadata);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class File {
	    id: string;
	    name: string;
	    path: string;
	    methods: Method[];
	
	    static createFrom(source: any = {}) {
	        return new File(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.path = source["path"];
	        this.methods = this.convertValues(source["methods"], Method);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace types {
	
	export class ResponseData {
	    id: string;
	    body: string;
	    mds: string;
	
	    static createFrom(source: any = {}) {
	        return new ResponseData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.body = source["body"];
	        this.mds = source["mds"];
	    }
	}
	export class RequestData {
	    id: string;
	    protoPath: string;
	    namespace: string;
	    serviceName: string;
	    methodName: string;
	    methodMode: number;
	    host: string;
	    body: string;
	    mds: string;
	    IncludeDirs: string;
	
	    static createFrom(source: any = {}) {
	        return new RequestData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.protoPath = source["protoPath"];
	        this.namespace = source["namespace"];
	        this.serviceName = source["serviceName"];
	        this.methodName = source["methodName"];
	        this.methodMode = source["methodMode"];
	        this.host = source["host"];
	        this.body = source["body"];
	        this.mds = source["mds"];
	        this.IncludeDirs = source["IncludeDirs"];
	    }
	}

}

