export namespace api {
	
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

export namespace client {
	
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

