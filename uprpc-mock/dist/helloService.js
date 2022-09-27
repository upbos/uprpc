"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldService = void 0;
const proto_loader_1 = require("@grpc/proto-loader");
const grpc_js_1 = require("@grpc/grpc-js");
const protoDir = __dirname + "/../proto/helloworld.proto";
class HelloWorldService {
    grpcDefinition;
    constructor() {
        var packageDefinition = (0, proto_loader_1.loadSync)(protoDir, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        this.grpcDefinition = (0, grpc_js_1.loadPackageDefinition)(packageDefinition);
    }
    registerService(server) {
        server.addService(this.grpcDefinition.helloworld.Greeter.service, {
            sayHelloSimple: this.sayHelloSimple,
            sayHelloSimpleError: this.sayHelloSimpleError,
            sayHelloServer: this.sayHelloServer,
            sayHelloClient: this.sayHelloClient,
            sayHelloDouble: this.sayHelloDouble,
        });
    }
    // 简单gRPC调用
    sayHelloSimple(call, callback) {
        console.log("sayHelloSimple 收到客户端请求：", call.request.name);
        let metadata = new grpc_js_1.Metadata();
        // keys that end with '-bin' must have Buffer values
        metadata.add("code", "code1");
        callback(null, { message: "Hello " + call.request.name }, metadata);
    }
    // 简单gRPC调用
    sayHelloSimpleError(call, callback) {
        console.log("sayHelloSimpleError 收到客户端请求：", call.request.name);
        // parse request metadata
        let callId = call.metadata.get("callId");
        console.log("callId=", callId);
        let s = 233;
        let code1 = Buffer.alloc(8);
        code1.writeIntLE(s, 0, 2);
        let code2 = Buffer.alloc(32);
        code2.writeDoubleLE(23333333.00002);
        let metadata = new grpc_js_1.Metadata();
        // keys that end with '-bin' must have Buffer values
        metadata.add("code-bin", code1);
        metadata.add("code-bin", Buffer.from("sss哈哈哈"));
        metadata.add("code-bin", code2);
        metadata.add("data", "sss");
        metadata.add("data", "21232323");
        callback(new Error("test error"), { message: "Hello " + call.request.name }, metadata);
        // callback(null, { message: "Hello " + call.request.name }, metadata);
    }
    // 简单gRPC调用
    sayHelloServer(call, callback) {
        console.log("sayHelloServer 收到客户端请求：", call.request.name);
        let count = 0;
        let s = setInterval(() => {
            call.write({
                message: call.request.name + "sayHelloServer: now time is:" + new Date(),
            });
            count++;
            if (count > 10) {
                let metadata = new grpc_js_1.Metadata();
                // keys that end with '-bin' must have Buffer values
                metadata.add("status", "complete");
                call.end(metadata);
                clearInterval(s);
            }
        }, 1000);
        call.on("end", function () {
            console.log("sayHelloServer: 客户端发送end,客户端关闭");
        });
    }
    // 简单gRPC调用
    sayHelloClient(call, callback) {
        call.on("data", (data) => {
            console.log("sayHelloClient: receive客户端: ", data);
        });
        call.on("close", function () {
            console.log("sayHelloClient:服务器发送end,客户端关闭");
            let metadata = new grpc_js_1.Metadata();
            metadata.add("status", "complete");
            callback(null, { message: "Hello sayHelloClient" }, metadata);
        });
    }
    // 简单gRPC调用
    sayHelloDouble(call, callback) {
        call.on("data", (data) => {
            console.log("sayHelloDouble: receive客户端:", data);
            call.write({ message: "sayHelloDouble: you send to me:" + data.name });
            if (data.name === "exit") {
                let metadata = new grpc_js_1.Metadata();
                metadata.add("status", "exited");
                call.end(metadata);
            }
        });
        call.on("end", (d) => {
            console.log("sayHelloDouble: end:", d);
        });
    }
}
exports.HelloWorldService = HelloWorldService;
//# sourceMappingURL=helloService.js.map