import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon, {SinonSandbox, SinonStub} from 'sinon';
import {DiscoveredGateway, Accessory, Light, GroupInfo, Group} from 'node-tradfri-client';
import {Client} from './client';
import assert from 'assert';

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

        sandbox.stub(Client.prototype, 'connect').resolves(true);
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

    it('should return devices', (done) => {
        const accessory = {lightList: [] as Light[]} as Accessory;
        sandbox.stub(Client.prototype, 'devices').value({1: accessory});

        chai.request(server)
            .get('/devices')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.body.should.have.property('1').property('lightList');
                done();
            });
    });

    it('should return groups', (done) => {
        const groupInfo = {group: {instanceId: 1} as Group} as GroupInfo;
        sandbox.stub(Client.prototype, 'groups').value({131074: groupInfo});

        chai.request(server)
            .get('/groups')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.body.should.have.property('131074').property('group').property('instanceId').equal(1);
                done();
            });
    });

    describe('Toggle Group Status (onOff)', () => {
        let operationGroupStub: SinonStub;

        beforeEach(() => {
            const groupInfo = {group: {instanceId: 1} as Group} as GroupInfo;
            sandbox.stub(Client.prototype, 'groups').value({131074: groupInfo});
            operationGroupStub = sandbox.stub(Client.prototype, 'operateGroup').resolves(true);
        });

        it('should return true on success', (done) => {
            chai.request(server)
                .post('/groups/131074/toggle')
                .end((err: any, res: any) => {
                    res.should.have.status(200);
                    res.body.should.have.property('toggled').equals(true);
                    done();
                });
        });

        it('should return false when groupId doesnt exists', (done) => {
            chai.request(server)
                .post('/groups/123/toggle')
                .end((err: any, res: any) => {
                    res.should.have.status(200);
                    res.body.should.have.property('toggled').equals(false);
                    done();
                });
        });

        it('should not call client', (done) => {
            chai.request(server)
                .post('/groups/123/toggle')
                .end((err: any, res: any) => {
                    assert.strictEqual(operationGroupStub.getCalls().length, 0);
                    done();
                });
        });

        it('should call client', (done) => {
            chai.request(server)
                .post('/groups/131074/toggle')
                .end((err: any, res: any) => {
                    assert.strictEqual(operationGroupStub.getCalls().length, 1);
                    done();
                });
        });
    });

    describe('Set Dimmer', () => {
        let operationGroupStub: SinonStub;

        beforeEach(() => {
            const groupInfo = {group: {instanceId: 1} as Group} as GroupInfo;
            sandbox.stub(Client.prototype, 'groups').value({131074: groupInfo});
            operationGroupStub = sandbox.stub(Client.prototype, 'operateGroupForDimming').resolves(true);
        });

        it('should return true on success', (done) => {
            chai.request(server)
                .post('/groups/131074/dimmer/5')
                .end((err: any, res: any) => {
                    res.should.have.status(200);
                    res.body.should.have.property('dimmed').equals(true);
                    res.body.should.have.property('value').equals('5');
                    done();
                });
        });
    });
});
