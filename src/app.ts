import * as tradfriClient from 'node-tradfri-client';
import {DiscoveredGateway, TradfriClient, Accessory} from "node-tradfri-client";

const cors = require('cors');
const express = require('express');
const app = express();

const port = 3000;
const securityCode = '';
let tradfriGateway: DiscoveredGateway | null;
let tradfri: TradfriClient;

app.use(cors());

app.get('/', (req: any, res: any) => {
    res.send('API is running. Discovered gateway: ' + (tradfriGateway ? tradfriGateway.name : '-'));
});

app.get('/devices', (req: any, res: any) => {
    res.send(tradfri.devices);
});

app.get('/groups', (req: any, res: any) => {
    res.send(tradfri.groups);
});

app.post('/groups/:groupId/toggle', async (req: any, res: any) => {
    const groupId = req.params.groupId;
    const group = tradfri.groups[groupId];
    if (!!group) {
        res.send({
            toggled: await tradfri.operateGroup(group.group, {onOff: !group.group.onOff}, true)
        });
    }
    res.send({toggled: false});
});

const server = app.listen(port, async () => {
    tradfriGateway = await tradfriClient.discoverGateway();
    if (tradfriGateway && !!tradfriGateway.host) {
        tradfri = new TradfriClient(tradfriGateway.host);
        const authToken = await tradfri.authenticate(securityCode);

        tradfri.connect(authToken.identity, authToken.psk);
        tradfri.observeGroupsAndScenes();
        tradfri.on('device updated', deviceUpdated).observeDevices();

        console.log('Authenticated and connected successfully');
        console.log(`API listening at http://localhost:${port}`)
    } else {
        // TODO: Error handling (tradfri gateway not found)
    }
});

/**
 * Workaround for the issue https://github.com/AlCalzone/node-tradfri-client/issues/390
 * Updating group onOff status when device status change
 * @param device
 */
function deviceUpdated(device: Accessory) {
    Object.keys(tradfri.groups).forEach((key: string) => {
        const deviceInGroup = tradfri.groups[key].group.deviceIDs.find((deviceId: number) => deviceId === device.instanceId);
        if (deviceInGroup && device.type === tradfriClient.AccessoryTypes.lightbulb) {
            tradfri.groups[key].group.onOff = device.lightList[0].onOff;
        }
    })
}

module.exports = server;
