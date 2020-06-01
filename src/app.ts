import {DiscoveredGateway, discoverGateway, TradfriClient} from "node-tradfri-client";

const express = require('express');
const app = express();

const port = 3000;
const securityCode = '';
let tradfriGateway: DiscoveredGateway;
let tradfri: TradfriClient;

app.get('/', (req: any, res: any) => {
    res.send('API is running. Discovered gateway: ' + tradfriGateway.name);
});

app.get('/devices', (req: any, res: any) => {
    res.send(tradfri.devices);
});

app.get('/groups', (req: any, res: any) => {
    res.send(tradfri.groups);
});

app.post('/groups/:groupId/toggle', (req: any, res: any) => {
    const groupId = req.params.groupId;
    const group = tradfri.groups[groupId];
    if (!!group) {
        tradfri.operateGroup(group.group, {onOff: !group.group.onOff}, true);
    } else {
        // TODO: Bad Request
    }
    res.send()
});

app.listen(port, () => {
    discoverGateway().then((discoveredGateway: DiscoveredGateway | null) => {
        if (discoveredGateway) {
            tradfriGateway = discoveredGateway;
            if (tradfriGateway.host != null) {
                tradfri = new TradfriClient(tradfriGateway.host);
                tradfri.authenticate(securityCode).then((authToken) => {
                    tradfri.connect(authToken.identity, authToken.psk);
                    tradfri.observeDevices();
                    tradfri.observeGroupsAndScenes();
                    console.log('Authenticated and connected successfully');
                    console.log(`Example app listening at http://localhost:${port}`)
                });
            }
        }
    });
});
