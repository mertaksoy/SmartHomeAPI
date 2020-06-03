import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon, {SinonSandbox} from 'sinon';
import {DiscoveredGateway, Accessory, Light} from "node-tradfri-client";
import {Client} from "./client";

chai.use(chaiHttp);
chai.should();

describe('Smart Home API', () => {
    let server: any;
    let sandbox: SinonSandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        sandbox.restore();

        const discoveredGateway = {name: 'gateway-name'} as DiscoveredGateway;
        const accessory = {lightList: [] as Light[]} as Accessory;

        sandbox.stub(Client.prototype, 'connect').resolves(true);
        sandbox.stub(Client.prototype, 'devices').value({1: accessory});
        sandbox.stub(Client.prototype, 'tradfriGateway').value(discoveredGateway);

        server = require('./app');
    });

    it('should start the app', (done) => {
        chai.request(server)
            .get('/')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.text.should.equals('API is running. Discovered gateway: gateway-name');
                done();
            });
    });

    it('should return device list', (done) => {
        chai.request(server)
            .get('/devices')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.body.should.have.property('1');
                done();
            });
    });
});
