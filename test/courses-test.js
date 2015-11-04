'use strict';

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

const course = {
    name: 'Ateliers Logiciel 3e',
    code: 'ATL3',
    description: 'A course',
    titulars: ['SRV', 'FPL'],
    tags: ['3e', 'Java']
};

const courses = [{
    name: 'Analyse 3e',
    code: 'ANL3',
    description: 'Analyse',
    titulars: ['FPL'],
    tags: ['3e', 'Java']
}, {
    name: 'Analyse 2e',
    code: 'ANL2',
    description: 'ANL 2e',
    titulars: ['FPL']
}];

const pRequest = {
    method: 'POST',
    url: '/courses',
    payload: course
};


const users = [{
    username: 'SRV',
    email: 'invalid@email.com',
    password: 'superpassword'
}, {
    username: 'FPL',
    email: 'invalid2@email.com',
    password: 'superpassword'
}];

const tags = [{
    name: '3e',
}, {
    name: 'Java'
}];

describe('Controller.Course', () => {
    describe('#post()', () => {
        it('should return 422 response because of invalid titulars/tags', done => {

            server.inject(pRequest, res => {
                const response = res.request.response.source;
                expect(response.statusCode).to.equal(422);

                done();
            });
        });

        it('should return the new added course', done => {
            const Models = server.plugins.models.models;
            const User = Models.User;
            const Tag = Models.Tag;

            const createUsers = new Promise((resolve, reject) => {
                let promises = [];
                users.forEach(u => promises.push(User.create(u)));
                Promise.all(promises).then(resolve);
            });


            const createTags = new Promise((resolve, reject) => {
                let promises = [];
                tags.forEach(t => promises.push(Tag.create(t)));
                Promise.all(promises).then(resolve);
            });



            Promise.all([createTags, createUsers])
                .then(() => {
                    server.inject(pRequest, res => {
                        const response = res.request.response.source;

                        expect(response.name).to.equal(course.name);
                        expect(response.code).to.equal(course.code);
                        expect(response.description).to.equal(course.description);
                        expect(response.titulars).to.be.an.array();
                        expect(response.titulars).to.have.length(pRequest.payload.titulars.length);
                        expect(response.titulars).to.only.include(pRequest.payload.titulars);

                        expect(response.tags).to.be.an.array();
                        expect(response.tags).to.have.length(pRequest.payload.tags.length);
                        expect(response.tags).to.only.include(pRequest.payload.tags);

                        done();
                    });
                });
        });

        it('Should return a 409 conflict because resource already exists', done => {
             server.inject(pRequest, res => {
                const response = res.request.response.source;

                expect(response.statusCode).to.equal(409);

                done();
            });
        });

    });

    describe('#get', () => {
        it('Should return the course with tags and titulars', done => {
            const request = {
                method: 'GET',
                url: '/courses/ATL3'
            };

            server.inject(request, res => {
                const response = res.request.response.source;

                expect(response.code).to.equal(course.code);
                expect(response.name).to.equal(course.name);
                expect(response.description).to.equal(course.description);
                expect(response.titulars).to.be.an.array();
                expect(response.titulars).to.have.length(users.length);
                expect(response.tags).to.be.an.array();
                expect(response.tags).to.have.length(tags.length);
                done();
            });
        });

        it ('Should return code 400 - bad validation', done => {
            const request = {
                method: 'GET',
                url: '/courses/_ATL3'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).to.equal(400);
                done();
            });
        });
    });

    describe('#getAll', () => {
        it ('Should return 3 courses', done => {
            let post = {
                method: 'POST',
                url: '/courses',
                payload: courses[0]
            };

            const request = {
                method: 'GET',
                url: '/courses'
            };

            server.inject(post, () => {
                post.payload = courses[1];
                server.inject(post, () => {
                    server.inject(request, res => {
                        const response = res.request.response.source;
                        expect(response).to.be.an.array();
                        expect(response).to.have.length(3);
                        done();
                    });
                });
            });
        });
    });

    describe('#delete', () => {
        const request = {
            method: 'DELETE',
            url: '/courses/ATL3'
        }
        it ('Should return 1', done => {
            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).to.equal(1);
                done();
            });
        });

        it ('Should return 0', done => {
            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).to.equal(0);
                done();
            });
        });
    });
});
