import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import * as tradfri from 'node-tradfri-client';
import {DiscoveredGateway, TradfriClient} from "node-tradfri-client";

chai.use(chaiHttp);
chai.should();

describe('Smart Home API', () => {
    let server: any;
    let sandbox = sinon.createSandbox();

    beforeEach(function () {
        sandbox.restore();

        const discoveredGateway = {
            host: 'my-host',
            name: 'my-name',
            addresses: ['192.168.0.6'],
            version: '1'
        } as DiscoveredGateway;
        const token = {identity: 'my-identity', psk: 'my-psk'} as { identity: string; psk: string; };

        sandbox.stub(tradfri, 'discoverGateway').returns(Promise.resolve(discoveredGateway));
        sandbox.stub(TradfriClient.prototype, 'observeGroupsAndScenes').returns(Promise.resolve());
        sandbox.stub(TradfriClient.prototype, 'observeDevices').returns(Promise.resolve());
        sandbox.stub(TradfriClient.prototype, 'authenticate').returns(Promise.resolve(token)).withArgs('');
        sandbox.stub(TradfriClient.prototype, 'connect').returns(Promise.resolve(true));

        server = require('./app');
    });

    it('should start the app', (done) => {
        chai.request(server)
            .get('/')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.text.should.equals('API is running. Discovered gateway: my-name');
                done();
            });
    });
});
