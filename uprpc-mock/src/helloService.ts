import { loadSync } from "@grpc/proto-loader";
import { loadPackageDefinition, GrpcObject, Server, ServerCredentials, Metadata, MetadataValue } from "@grpc/grpc-js";
import { clearLine } from "readline";

const protoDir = __dirname + "/../proto/helloworld.proto";

export class HelloWorldService {
    grpcDefinition: any;
    constructor() {
        var packageDefinition = loadSync(protoDir, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        this.grpcDefinition = loadPackageDefinition(packageDefinition);
    }

    registerService(server: Server) {
        server.addService(this.grpcDefinition.helloworld.Greeter.service, {
            sayHelloSimple: this.sayHelloSimple,
            sayHelloSimpleError: this.sayHelloSimpleError,
            sayHelloServer: this.sayHelloServer,
            sayHelloClient: this.sayHelloClient,
            sayHelloDouble: this.sayHelloDouble,
        });
    }
    // 简单gRPC调用
    sayHelloSimple(call: any, callback: any) {
        console.log("sayHelloSimple 收到客户端请求：", call.request.name);
        let metadata = new Metadata();
        // keys that end with '-bin' must have Buffer values
        metadata.add("code", "code1");
        callback(null, { message: "Hello " + call.request.name }, metadata);
    }
    // 简单gRPC调用
    sayHelloSimpleError(call: any, callback: any) {
        console.log("sayHelloSimpleError 收到客户端请求：", call.request.name);
        // parse request metadata
        let callId = call.metadata.get("callId");
        let codebin = call.metadata.get("code-bin");
        console.log("callId=", callId, Buffer.from(codebin).toString());
        let s = 233;
        let code1: Buffer = Buffer.alloc(8);
        code1.writeIntLE(s, 0, 2);

        let code2: Buffer = Buffer.alloc(32);
        code2.writeDoubleLE(23333333.00002);

        let metadata = new Metadata();
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
    sayHelloServer(call: any, callback: any) {
        console.log("sayHelloServer 收到客户端请求：", call.request.name);
        let count = 0;
        let s = setInterval(() => {
            let ss = call.write({
                message: call.request.name + "sayHelloServer: now time is:" + new Date(),
            });
            console.log("sayHelloServer: send to client:", ss);
            count++;
            if (count > 10) {
                let metadata = new Metadata();
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
    sayHelloClient(call: any, callback: any) {
        call.on("data", (data: any) => {
            console.log("sayHelloClient: receive客户端: ", data);
        });
        call.on("close", function () {
            console.log("sayHelloClient:服务器发送end,客户端关闭");
            let metadata = new Metadata();
            metadata.add("status", "complete");
            callback(null, { message: "Hello sayHelloClient" }, metadata);
        });
    }
    // 简单gRPC调用
    sayHelloDouble(call: any, callback: any) {
        call.on("data", (data: any) => {
            console.log("sayHelloDouble: receive客户端:", data);
            call.write({ message: "sayHelloDouble: you send to me:" + data.name });
            if (data.name === "exit") {
                let metadata = new Metadata();
                metadata.add("status", "exited");
                call.end(metadata);
            }
        });
        call.on("end", (d: any) => {
            console.log("sayHelloDouble: end:", d);
            let metadata = new Metadata();
            metadata.add("status", "exited");
            call.end(metadata);
        });
    }
}
