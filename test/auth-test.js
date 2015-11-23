'use strict';

const Code = require('code');
const Lab = require('lab');
const Hoek = require('hoek');
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

describe('Controller.Auth', () => {
    describe('#logout', () => {
        it ('Should return 204 no content', done => {

            const request = {
                method: 'POST',
                url: '/logout',
                headers: internals.headers
            };


            server.inject(request, function(res) {
                const response = res.request.response.source;
                expect(response).to.not.exists();
                expect(res.request.response.statusCode).to.equal(204);
                done();
            });
        });

        it ('Should return 401 unauthorized (revoked token)', done => {

            const request = {
                method: 'POST',
                url: '/logout',
                headers: internals.headers
            };

            server.inject(request, function(res) {
                expect(res.request.response.statusCode).to.equal(401);
                done();
            });

        });



    });

    describe('#login', () => {
        it ('Should return 200', done => {
            const token = internals.headers.Authorization;
            const request = {
                method: 'POST',
                url: '/login',
                payload: {
                    username: 'admin',
                    password: 'admin'
                }
            };

            server.inject(request, function(res) {
                const response = res.request.response;
                expect(response.statusCode).to.equal(200);
                expect(response.source.token).to.equal(token);
                done();
            });
        });
    });

    describe('#me', () => {
        it('Should return the admin user', done => {
            const request = {
                method: 'GET',
                url: '/me',
                headers: internals.headers
            };

            server.inject(request, function(res) {
                const response = res.request.response;
                expect(response.statusCode).to.equal(200);
                const user = response.source;
                expect(user.username).to.equal('admin');
                expect(user.firstName).to.equal('admin');
                expect(user.lastName).to.equal('admin');
                expect(user.email).to.equal('admin@admin.com');
                done();
            });
        });
    });
});
