import {Accessory, AccessoryTypes, DiscoveredGateway, discoverGateway, TradfriClient} from "node-tradfri-client";

const cors = require('cors');
const express = require('express');
const app = express();

const port = 3000;
const securityCode = '';
let tradfriGateway: DiscoveredGateway;
let tradfri: TradfriClient;


app.use(cors());

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
        tradfri.operateGroup(group.group, {onOff: !group.group.onOff}, true).then((updateResult) => {
            res.send({toggled: updateResult});
        }).catch(() => res.send({toggled: false}));
    } else {
        res.send({toggled: false});
    }
});

app.listen(port, () => {
    discoverGateway().then((discoveredGateway: DiscoveredGateway | null) => {
        if (discoveredGateway) {
            tradfriGateway = discoveredGateway;
            if (tradfriGateway.host != null) {
                tradfri = new TradfriClient(tradfriGateway.host);
                tradfri.authenticate(securityCode).then((authToken) => {
                    tradfri.connect(authToken.identity, authToken.psk);
                    tradfri.observeGroupsAndScenes();
                    tradfri.on('device updated', deviceUpdated).observeDevices();

                    console.log('Authenticated and connected successfully');
                    console.log(`Example app listening at http://localhost:${port}`)
                });
            }
        }
    });
});

function deviceUpdated(device: Accessory) {
    Object.keys(tradfri.groups).forEach((key: string) => {
        const deviceInGroup = tradfri.groups[key].group.deviceIDs.find((deviceId: number) => deviceId === device.instanceId);
        if (deviceInGroup && device.type === AccessoryTypes.lightbulb) {
            tradfri.groups[key].group.onOff = device.lightList[0].onOff;
        }
    })
}
