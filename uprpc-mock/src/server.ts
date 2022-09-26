import { Server, ServerCredentials } from "@grpc/grpc-js";
import { HelloWorldService } from "./helloService";

const host = "0.0.0.0:9000";

export async function start() {
    var server = new Server();

    // load proto and register
    let helloService = new HelloWorldService();
    helloService.registerService(server);

    await new Promise((resolve, reject) => {
        server.bindAsync(host, ServerCredentials.createInsecure(), (err, result) =>
            err ? reject(err) : resolve(result)
        );
    });
    server.start();
    console.log("server started, listening at: ", host);
}
