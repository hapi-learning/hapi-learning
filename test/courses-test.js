'use strict';

const Code = require('code');
const Lab = require('lab');
const fs = require('fs');
const Path = require('path');
const Hoek = require('hoek');
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

after(done => {
    const rm = require('rmdir');
    rm(Path.join(__dirname, 'storage'), function() {
        done();
    });
});

const course = {
    name: 'Ateliers Logiciel 3e',
    code: 'ATL3',
    description: 'A course',
    teachers: ['SRV', 'FPL'],
    tags: ['3e', 'Java']
};

const courses = [{
    name: 'Analyse 3e',
    code: 'ANL3',
    description: 'Analyse',
    teachers: ['FPL'],
    tags: ['3e', 'Java']
}, {
    name: 'Analyse 2e',
    code: 'ANL2',
    description: 'ANL 2e',
    teachers: ['FPL']
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

const moreUsers = [{
    username: 'ABS',
    email: 'invalid3@email.com',
    password: 'superpassword'
}, {
    username: 'ADT',
    email: 'invalid4@email.com',
    password: 'superpassword'
}];

const tags = [{
    name: '3e',
}, {
    name: 'Java'
}];

const moreTags = [{
    name: '2e'
}, {
    name: 'NodeJS'
}, {
    name: '1e'
}];

describe('Controller.Course', () => {
    describe('#post()', () => {
        it('should return 422 response because of invalid teachers/tags', done => {

            server.inject(pRequest, res => {
                const response = res.request.response.source;
                expect(response.statusCode).to.equal(422);

                fs.stat('storage/courses/ATL3', function(err, stats) {
                    expect(err).to.exists();
                    expect(stats).to.be.undefined();

                    done();
                });
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
                        expect(response.teachers).to.be.an.array();
                        expect(response.teachers).to.have.length(pRequest.payload.teachers.length);
                        expect(response.teachers).to.only.include(pRequest.payload.teachers);

                        expect(response.tags).to.be.an.array();
                        expect(response.tags).to.have.length(pRequest.payload.tags.length);
                        expect(response.tags).to.only.include(pRequest.payload.tags);

                        fs.stat(Path.join(__dirname, 'storage/courses/ATL3'), function(err, stats) {

                            expect(err).to.be.null();
                            expect(stats).to.exists();
                            expect(stats.isDirectory()).to.be.true();

                            fs.stat(Path.join(__dirname, 'storage/courses/ATL3/documents'), function(err, stats) {
                                expect(err).to.be.null();
                                expect(stats).to.exists();
                                expect(stats.isDirectory()).to.be.true();
                                done();
                            });
                        });
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
        it('Should return the course with tags and teachers', done => {
            const request = {
                method: 'GET',
                url: '/courses/ATL3'
            };

            server.inject(request, res => {
                const response = res.request.response.source;

                expect(response.code).to.equal(course.code);
                expect(response.name).to.equal(course.name);
                expect(response.description).to.equal(course.description);
                expect(response.teachers).to.be.an.array();
                expect(response.teachers).to.have.length(users.length);
                expect(response.tags).to.be.an.array();
                expect(response.tags).to.have.length(tags.length);
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
            url: '/courses/ANL3'
        };
        it ('Should return 1', done => {
            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).to.equal(1);

                // Not clean ...
                setTimeout(() => {
                    fs.stat(Path.join(__dirname, 'storage/courses/ANL3'), function(err, stats) {
                        expect(err).to.exists();
                        expect(stats).to.be.undefined();
                        done();
                    });
                }, 1000);
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

    describe('#getStudents', () => {
        const request = {
            method: 'GET',
            url: '/courses/ATL3/students'
        };

        it ('Should return empty array', done => {
            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response).to.be.an.array();
                expect(response).to.have.length(0);
                done();
            });
        });

        it ('Should return an array with 1 users', done => {
            const Course = server.plugins.models.models.Course;
            const user = {
                username: 'kevin2004',
                password: 'jsstrofor',
                firstName: 'Kevin',
                lastName: 'Keke',
                email: 'bogoss2004@hotmail.fr'
            };

            Course
                .findOne({where: { code: { $eq: 'ATL3'}}})
                .then(course => {
                    course.createUser(user)
                        .then(() => {
                            server.inject(request, res => {
                                const response = res.request.response.source;
                                expect(response).to.be.an.array();
                                expect(response).to.have.length(1);
                                done();
                            });
                    });
                });


        });
    });

    describe('#patch', () => {
        const request = {
            method: 'PATCH',
            url: '/courses/ATL3',
            payload: {
                name: 'Ateliers Logiciels Gestion',
                code: 'ATL3G'
            }
        };

        it ('Should return the number of rows updated (0)', done => {

            const copyRequest = Hoek.applyToDefaults(request, {url : '/courses/ABCD'});

            server.inject(copyRequest, res => {

                const response = res.request.response.source;

                expect(response.count).to.equal(0);

                done();
            });
        });

        it ('Should return the number of rows updated (1)', done => {
            server.inject(request, res => {
                const response = res.request.response.source;

                expect(response.count).to.equal(1);

                fs.stat(Path.join(__dirname, 'storage/courses/ATL3G'), function(err, stats) {
                    expect(err).to.be.null();
                    expect(stats).to.exists();
                    expect(stats.isDirectory()).to.be.true();

                    fs.stat(Path.join(__dirname, 'storage/courses/ATL3'), function(err, stats) {
                        expect(err).to.exists();
                        expect(stats).to.be.undefined();
                        done();
                    });
                });
            });
        });

        it ('Should return the updated course', done => {
            server.inject({method: 'GET', url:'/courses/ATL3G'}, res => {
                const response = res.request.response.source;

                expect(response.code).to.equal(request.payload.code);
                expect(response.name).to.equal(request.payload.name);
                expect(response.description).to.equal(course.description);
                expect(response.teachers).to.be.an.array();
                expect(response.teachers).to.have.length(users.length);
                expect(response.tags).to.be.an.array();
                expect(response.tags).to.have.length(tags.length);

                done();
            });
        });
    });

    describe('#addTags', () => {

        const Models = server.plugins.models.models;
        const Tag = Models.Tag;

        const request = {
            method: 'POST',
            url: '/courses/ATL3G/tags',
            payload: {
                tags: ['2e', 'NodeJS', '1e', '4e'] // 3 existing tags and 1 non existing
            }
        };

        it('Should return the course with the new tags', done => {

             const createTags = new Promise((resolve, reject) => {
                let promises = [];
                moreTags.forEach(t => promises.push(Tag.create(t)));
                Promise.all(promises).then(resolve);
            });

            createTags
            .then(() => {
                server.inject(request, res => {
                    const response = res.request.response.source;

                    const allTags = ['3e', 'Java', '2e', 'NodeJS', '1e'];
                    expect(response.tags).to.only.include(allTags);
                    done();
                });
            });
        });

          it('Should return 404 course not found', done => {

            const copyRequest = Hoek.applyToDefaults(request, { url: '/courses/ATL/tags'});

            server.inject(copyRequest, res => {
                const response = res.request.response.source;
                expect(response.statusCode).to.equal(404);
                done();
            });
        });
    });
});
