import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import * as tradfri from 'node-tradfri-client';

chai.use(chaiHttp);
chai.should();

describe('Smart Home API', () => {
    let server: any;
    let sandbox = sinon.createSandbox();

    beforeEach(function () {
        sandbox.stub(tradfri, 'discoverGateway').returns(Promise.resolve(null));
        server = require('./app');
    });

    it('should start the app', (done) => {
        chai.request(server)
            .get('/')
            .end((err: any, res: any) => {
                res.should.have.status(200);
                res.text.should.equals('API is running. Discovered gateway: -');
                done();
            });
    });
});
