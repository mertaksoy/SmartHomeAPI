import {DiscoveredGateway, discoverGateway, TradfriClient} from "node-tradfri-client";
import {ServerResponse, createServer, IncomingMessage} from "http";

const hostname = '127.0.0.1';
const port = 3000;
const securityCode = '';

let tradfriGateway: DiscoveredGateway;
let tradfri: TradfriClient;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url == '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<html><body><p> API is running. Discovered gateway: ' + tradfriGateway.name + '</p></body></html>');
        res.end();
    } else if (req.url == '/devices') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(tradfri.devices));
        res.end();
    }
});

server.listen(port, hostname, () => {
    discoverGateway().then((discoveredGateway: DiscoveredGateway | null) => {
        if (discoveredGateway) {
            tradfriGateway = discoveredGateway;
            if (tradfriGateway.host != null) {
                tradfri = new TradfriClient(tradfriGateway.host);
                tradfri.authenticate(securityCode).then((authToken) => {
                    tradfri.connect(authToken.identity, authToken.psk);
                    tradfri.observeDevices();
                });
            }
        }
    });
    console.log(`Server running at http://${hostname}:${port}/`);
});
