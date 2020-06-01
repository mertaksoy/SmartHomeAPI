import {discoverGateway} from "node-tradfri-client";
import {ServerResponse, createServer} from "http";

const hostname = '127.0.0.1';
const port = 3000;

let tradfriGateway;

const server = createServer((req: any, res: ServerResponse) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Smart Home API is running');
});

server.listen(port, hostname, () => {
    discoverGateway().then((discoveredGateway) => {
        console.log(discoveredGateway);
        tradfriGateway = discoveredGateway;
    });
    console.log(`Server running at http://${hostname}:${port}/`);
});
