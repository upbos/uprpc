"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const helloService_1 = require("./helloService");
const host = "0.0.0.0:9000";
async function start() {
    var server = new grpc_js_1.Server();
    // load proto and register
    let helloService = new helloService_1.HelloWorldService();
    helloService.registerService(server);
    await new Promise((resolve, reject) => {
        server.bindAsync(host, grpc_js_1.ServerCredentials.createInsecure(), (err, result) => err ? reject(err) : resolve(result));
    });
    server.start();
    console.log("server started, listening at: ", host);
}
exports.start = start;
//# sourceMappingURL=server.js.map