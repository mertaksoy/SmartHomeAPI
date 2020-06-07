import sinon, {SinonSandbox} from 'sinon';

import * as tradfri from 'node-tradfri-client';
import {
    Accessory,
    AccessoryTypes,
    DiscoveredGateway,
    discoverGateway,
    Group,
    GroupInfo,
    Light,
    TradfriClient
} from 'node-tradfri-client';
import {Client} from './client';
import assert from 'assert';


describe('Client', () => {
    let sandbox: SinonSandbox;
    let client: Client;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        sandbox.restore();
        sandbox.stub(tradfri, 'discoverGateway').resolves({host: 'host'} as DiscoveredGateway);
        sandbox.stub(TradfriClient.prototype, 'observeGroupsAndScenes').resolves();
        sandbox.stub(TradfriClient.prototype, 'observeDevices').resolves();
        sandbox.stub(TradfriClient.prototype, 'authenticate').resolves({
            identity: 'identity',
            psk: 'psk'
        }).withArgs('');
        sandbox.stub(TradfriClient.prototype, 'connect').resolves(true);

        client = new Client();
    });

    it('should return true when connection successful', async () => {
        const connectionResult = await client.connect();
        assert.strictEqual(connectionResult, true);
    });

    it('should return false when connection fails', async () => {
        sandbox.restore();
        sandbox.stub(tradfri, 'discoverGateway').resolves(null);

        const connectionResult = await client.connect();
        assert.strictEqual(connectionResult, false);
    });

    describe('Connected', () => {

        beforeEach(async () => {
            await client.connect();
        });

        it('should operate for group', async () => {
            sandbox.stub(TradfriClient.prototype, 'operateGroup').resolves(true);
            const operationResult = await client.operateGroup({} as Group, true);
            assert.strictEqual(operationResult, true);
        });

        it('should return gateway information', async () => {
            const tradfriGateway = await client.tradfriGateway;

            // @ts-ignore
            assert.strictEqual(tradfriGateway.host, 'host');
        });

        it('should return tradfri', async () => {
            const tradfri = await client.tradfri;
            assert.ok(tradfri);
        });
    });
});
