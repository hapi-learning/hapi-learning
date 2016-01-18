'use strict';

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();


const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;


let server;

const internals = {};

before((done) => {

    server = require('./server-test');
    const Models = server.app.models;
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
            })
            .then((user) => {

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

        it('Should return 204 no content', (done) => {

            const request = {
                method: 'POST',
                url: '/logout',
                headers: internals.headers
            };


            server.inject(request, (res) => {

                const response = res.request.response.source;
                expect(response).to.not.exists();
                expect(res.request.response.statusCode).to.equal(204);
                done();
            });
        });

        it('Should return 401 unauthorized (revoked token)', (done) => {

            const request = {
                method: 'POST',
                url: '/logout',
                headers: internals.headers
            };

            server.inject(request, (res) => {

                expect(res.request.response.statusCode).to.equal(401);
                done();
            });

        });



    });

    describe('#login', () => {

        it('Should return 200', (done) => {

            const request = {
                method: 'POST',
                url: '/login',
                payload: {
                    username: 'admin',
                    password: 'admin'
                }
            };

            server.inject(request, (res) => {

                const response = res.request.response;
                internals.headers.Authorization = res.request.response.source.token;
                console.log('HEYYY');
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    describe('#me', () => {

        it('Should return the admin user', (done) => {

            setTimeout(() => {

                const request = {
                    method: 'GET',
                    url: '/me',
                    headers: internals.headers
                };


                server.inject(request, (res) => {

                    const response = res.request.response;
                    expect(response.statusCode).to.equal(200);
                    const user = response.source;
                    expect(user.username).to.equal('admin');
                    expect(user.firstName).to.equal('admin');
                    expect(user.lastName).to.equal('admin');
                    expect(user.email).to.equal('admin@admin.com');
                    done();
                });
            }, 1000);
        });
    });

    describe('#getCourses', () => {

        it('Should return an empty array', (done) => {

            const request = {
                method: 'GET',
                url: '/me/courses',
                headers: internals.headers
            };

            server.inject(request, (res) => {

                expect(res.request.response.source).to.be.an.array();
                expect(res.request.response.source).to.have.length(0);
                done();
            });

        });

        it('Should return 1 course', (done) => {

            const request = {
                method: 'GET',
                url: '/me/courses',
                headers: internals.headers
            };

            server.inject({
                method: 'POST',
                url: '/courses',
                payload: {
                    name: 'Course',
                    code: 'ABCD'
                },
                headers: internals.headers
            }, () => {

                server.inject({
                    method: 'POST',
                    url: '/users/admin/subscribe/ABCD',
                    headers: internals.headers
                }, () => {

                    server.inject(request, (res) => {

                        expect(res.request.response.source).to.be.an.array();
                        expect(res.request.response.source).to.have.length(1);
                        done();
                    });
                });
            });

        });
    });

    describe('#getNews', () => {

        it('Should return empty array', (done) => {

            const request = {
                method: 'GET',
                url: '/me/news',
                headers: internals.headers
            };

            server.inject(request, (res) => {

                expect(res.request.response.source.results).to.be.an.array();
                expect(res.request.response.source.results).to.have.length(0);
                expect(res.request.response.source.meta.count).to.equal(0);
                done();
            });
        });

        it('Should return one news', (done) => {

            const request = {
                method: 'GET',
                url: '/me/news',
                headers: internals.headers
            };

            server.inject({
                method: 'POST',
                url: '/news',
                payload: {
                    username: 'admin',
                    code: 'ABCD',
                    subject: 'news',
                    content: 'content',
                    priority: 'info'
                },
                headers: internals.headers
            }, () => {

                server.inject(request, (res) => {

                    expect(res.request.response.source.results).to.be.an.array();
                    expect(res.request.response.source.results).to.have.length(1);
                    done();
                });
            });
        });

        it('Should return one news', (done) => {

            const request = {
                method: 'GET',
                url: '/me/news',
                headers: internals.headers
            };

            server.inject({
                method: 'POST',
                url: '/news',
                payload: {
                    username: 'admin',
                    subject: 'news',
                    content: 'content',
                    priority: 'info'
                },
                headers: internals.headers
            }, () => {

                server.inject(request, (res) => {

                    expect(res.request.response.source.results).to.be.an.array();
                    expect(res.request.response.source.results).to.have.length(2);
                    done();
                });
            });
        });
    });
});
