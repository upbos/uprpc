export namespace client {
	
	export class Metadata {
	    id?: string;
	    key?: string;
	    value: number[];
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
	export class RequestData {
	    id?: string;
	    protoPath?: string;
	    serviceName?: string;
	    serviceFullyName?: string;
	    methodName?: string;
	    methodMode?: number;
	    host?: string;
	    body?: string;
	    mds?: Metadata[];
	    includeDirs?: string[];
	
	    static createFrom(source: any = {}) {
	        return new RequestData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.protoPath = source["protoPath"];
	        this.serviceName = source["serviceName"];
	        this.serviceFullyName = source["serviceFullyName"];
	        this.methodName = source["methodName"];
	        this.methodMode = source["methodMode"];
	        this.host = source["host"];
	        this.body = source["body"];
	        this.mds = this.convertValues(source["mds"], Metadata);
	        this.includeDirs = source["includeDirs"];
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

export namespace main {
	
	export class R {
	    success?: boolean;
	    message?: string;
	    data?: any;
	
	    static createFrom(source: any = {}) {
	        return new R(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.data = source["data"];
	    }
	}

}

