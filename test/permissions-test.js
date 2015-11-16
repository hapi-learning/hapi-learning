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

let server;

const internals = {};

before((done) => {
    server = require('./server-test');
    const Models = server.plugins.models.models;
    Models.sequelize.sync({
        force: true
    }).then(() => {
        Models.Permission.create({"type":1,"description":"COURS CREATE"});
        Models.Permission.create({"type":2,"description":"COURS READ"});
        Models.Permission.create({"type":3,"description":"COURS UPDATE"});
        Models.Permission.create({"type":4,"description":"COURS DELETE"});

        Models.Role.create({
            name: 'admin'
        }).then(() => {
             Models.User.create({
                username: 'admin',
                password: 'admin',
                role_id: 1,
                email: 'admin@admin.com',
                firstName: 'admin',
                lastName: 'admin'
            }).then(user => {
                    server.inject({
                        method: 'POST',
                        url: '/login',
                        payload: {
                            username: 'admin',
                            password: 'admin'
                        }
                    }, (res) => {
                        internals.headers = {
                            Authorization: res.request.response.source.token
                        };
                        done();
                    });
            });
        });

    });

});

describe('Controller.Permission', () => {

    describe('#getAll()', () => {

        it('should return every permissions', done => {

            const request = {
                method: 'GET',
                url: '/permissions',
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response).to.be.an.array();
                expect(response).to.have.length(4);
                done();
            });
        });
    });

    describe('#get()', () => {

        it('should return specific permission', done => {

            const request = {
                method: 'GET',
                url: '/permissions/1',
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.type).to.equal(res.request.params.type);
                expect(response.description).to.equal('COURS CREATE');
                done();
            });
        });

        it('should throw an error because of inexistant permission', done => {

            const request = {
                method: 'GET',
                url: '/permissions/2000000',
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(404);
                done();
            });
        });
    });
});
