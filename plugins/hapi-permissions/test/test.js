'use strict';

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const _  = require('lodash');


const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

let server;


before(function(done) {
    server = require('./server');
    done();
});

describe('hapi-permissions', function() {
    describe('Wrong permissions', function() {
        it ('Route /A', done => {
            const request = {
                method: 'GET',
                url: '/A',
            };

            server.inject(request, res => {
                expect(res.request.response.statusCode).to.equal(200);
                done();
            });
        });
    });
});
