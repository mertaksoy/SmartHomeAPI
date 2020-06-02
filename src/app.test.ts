import chai from 'chai';
import chaiHttp from 'chai-http';

import sinon from 'sinon';

import * as tradfri from 'node-tradfri-client';

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('Smart Home API', () => {
    let server: any;

    beforeEach(function () {
        sinon.stub(tradfri, 'discoverGateway').resolves(null);
        server = require('./app');
    });

    it("should start the app", (done) => {
        chai.request(server)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.equals('API is running');
                done();
            });
    });
});
