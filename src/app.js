const tradfriClient = require("node-tradfri-client");
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
let tradfriGateway;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Smart Home API is running');
});

server.listen(port, hostname, () => {
    tradfriClient.discoverGateway().then((res) => {
        console.log(res);
        tradfriGateway = res;
    });
    console.log(`Server running at http://${hostname}:${port}/`);
});
