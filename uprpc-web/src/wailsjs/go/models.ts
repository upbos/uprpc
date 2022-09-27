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

