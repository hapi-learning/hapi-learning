'use strict';

const _ = require('lodash');
const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const server = require('./server-test');

before((done) => {
    const Models = server.plugins.models.models;
    Models.sequelize.sync({
        force: true
    }).then(() => done());

});

describe('Controller.Role', () => {

    describe('#post()', () => {

        it('should return error because empty role name', done => {

            const request = {
                method: 'POST',
                url: '/roles',
                payload: {
                    name: ''
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).to.equal(400);
                done();
            });
        });

        it('should return the created object', done => {

            const request = {
                method: 'POST',
                url: '/roles',
                payload: {
                    name: 'guest'
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).to.equal(201);
                expect(response.name).to.equal(request.payload.name);
                done();
            });
        });

        it('should return error because this role already exist', done => {

            const request = {
                method: 'POST',
                url: '/roles',
                payload: {
                    name: 'guest'
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).to.equal(409);
                done();
            });
        });

    });

    describe('#getAll()', () => {

        it('should return every roles', done => {

            const request = {
                method: 'GET',
                url: '/roles'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response).to.be.an.array();
                expect(response).to.have.length(1);
                done();
            });
        });
    });

    describe('#get()', () => {

        it('should return specific role', done => {

            const request = {
                method: 'GET',
                url: '/roles/guest'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.name).to.equal('guest');
                done();
            });
        });

        it('should throw an error because of inexistant role', done => {

            const request = {
                method: 'GET',
                url: '/roles/IWillProbablyNeverExist'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(404);
                done();
            });
        });
    });

    describe('#delete()', () => {

        it('should return 1 deleted role', done => {

            const request = {
                method: 'DELETE',
                url: '/roles/guest'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(1);
                done();
            });
        });

        it('should return 0 deleted role', done => {

            const request = {
                method: 'DELETE',
                url: '/roles/IWillProbablyNeverExist'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(0);
                done();
            });
        });
    });
});
