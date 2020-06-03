import {Client} from './client';

const cors = require('cors');
const express = require('express');

const port = 3000;

const client = new Client();
const app = express();

app.use(cors());

app.get('/', (req: any, res: any) => {
    res.send('API is running. Discovered gateway: ' + (!!client.tradfriGateway ? client.tradfriGateway.name : '-'));
});

app.get('/devices', (req: any, res: any) => {
    res.send(client.devices);
});

app.get('/groups', (req: any, res: any) => {
    res.send(client.groups);
});

app.post('/groups/:groupId/toggle', async (req: any, res: any) => {
    const groupId = req.params.groupId;
    const group = client.groups[groupId];
    if (!!group) {
        res.send({
            toggled: await client.operateGroup(group.group, !group.group.onOff)
        });
        return;
    }
    res.send({toggled: false});
});

const server = app.listen(port, async () => {
    const isConnected = await client.connect();
    if (isConnected) {
        console.log(`API listening at http://localhost:${port}`)
    } else {
        // TODO: Error handling
    }
});

module.exports = server;
