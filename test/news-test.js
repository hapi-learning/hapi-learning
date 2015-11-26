'use strict';

const Code = require('code');
const Lab = require('lab');
const fs = require('fs');
const Path = require('path');
const Hoek = require('hoek');
const lab = exports.lab = Lab.script();
const _ = require('lodash');


const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;


let server;

const internals = {};

internals.newsWrongUser = {
    subject : 'subject',
    content : 'content',
    username : 'Johnny',
    code : 'SYS2'
};
internals.newsWrongCourse = {
    subject : 'subject',
    content : 'content',
    username : 'abell2r',
    code : 'SYS23'
};
internals.newsCourseUnrelated = {
    subject : 'subject',
    content : 'content',
    username : 'afox1d'
};
internals.newsCourseRelated = {
    subject : 'subject',
    content : 'content',
    username : 'abell2r',
    code : 'SYS2'
};

before((done) => {
    server = require('./server-test');
    const Models = server.plugins.models.models;
    Models.sequelize.sync({
        force: true
    }).then(() => {


        Models.Role.create({
                name: 'teacher'
            })
            .then(() => {

                [
                    {
                        "lastName": "Fox",
                        "username": "afox1d",
                        "password": "z5MVzJofc",
                        "email": "afox1d@miibeian.gov.cn",
                        "firstName": "Maïlis",
                        "phoneNumber": "86-(542)216-1760",
                        "role_id": 1
                    },
                    {
                        "lastName": "Bell",
                        "username": "abell2r",
                        "password": "3ewXqRiD",
                        "email": "rbell2r@tamu.edu",
                        "firstName": "Cécilia",
                        "phoneNumber": "86-(855)518-2799",
                        "role_id": 2
                    }
                ].forEach(user => Models.User.create(user));

                [
                    {
                        "code": "TMP56GATL",
                        "name": "Ateliers Logiciel 3e",
                        "teachers": ["FPL", "SRV"],
                        "tags": ["3e", "Java", "Gestion"]
                    },
                    {
                        "code": "SYS2",
                        "name": "Système 2e",
                        "teachers": ["MBA"],
                        "tags": ["2e"]
                    }
                ].forEach(cours => Models.Course.create(cours));
            });

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

after(done => {
    const rm = require('rmdir');
    rm(Path.join(__dirname, 'storage'), function () {
        done();
    });
});

describe('Controller.News', () => {
    describe('#post', () => {
        it('should return statusCode 201 and created news related to course', done => {
            const request = {
                method: 'POST',
                url: '/news',
                payload : internals.newsCourseRelated,
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(201);
                expect(response.user).equal(internals.newsCourseRelated.username);
                expect(response.course).equal(internals.newsCourseRelated.code);
                done();
            });
        });

        it('should return statusCode 201 and created news unrelated to course', done => {
            const request = {
                method: 'POST',
                url: '/news',
                payload : internals.newsCourseUnrelated,
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(201);
                expect(response.user).equal(internals.newsCourseUnrelated.username);
                expect(response.course).equal(undefined);
                done();
            });
        });

        it('should return statusCode 422 : invalid user', done => {
            const request = {
                method: 'POST',
                url: '/news',
                payload : internals.newsWrongUser,
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(422);
                done();
            });
        });

         it('should return statusCode 422 : invalid course', done => {
            const request = {
                method: 'POST',
                url: '/news',
                payload : internals.newsWrongCourse,
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(422);
                done();
            });
        });
    });
    describe('#get', () => {
        it('should return statusCode 200 and specific news', done => {
            const request = {
                method: 'GET',
                url: '/news/1',
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(200);
                expect(response.user).equal(internals.newsCourseRelated.username);
                expect(response.course).equal(internals.newsCourseRelated.code);
                done();
            });
        });

        it('should return statusCode 404', done => {
            const request = {
                method: 'GET',
                url: '/news/3999999',
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(404);
                done();
            });
        });
    });
    describe('#getAll', () => {
        it('should return statusCode 200 and every news', done => {
            const request = {
                method: 'GET',
                url: '/news',
                headers: internals.headers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(200);
                expect(response).to.be.an.array();
                expect(response).to.have.length(2);
                done();
            });
        });
    });
});
