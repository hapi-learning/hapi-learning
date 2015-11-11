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
    }).then(() => {
        [
            {"name": "admin"},
            {"name": "teacher"},
            {"name": "student"}
        ].forEach(role => Models.Role.create(role));

        [
            {"name":"Extra-course"},
            {"name":"COBOL_1"},
            {"name":"3G12"},
            {"name":"Languages"},
            {"name":"3R13"},
            {"name": "2I12"},
            {"name": "Theory"},
            {"name": "Over"},
            {"name": "Laboratory"}
        ].forEach(tag => Models.Tag.create(tag));

        [
    {
        "code": "ANA3",
        "name": "Analyse 3e",
        "teachers": ["FPL"],
        "tags": ["3e", "Gestion"]
    },
    {
        "code": "DEV1",
        "name": "Développement 1e",
        "teachers": ["MCD", "SRV", "HAL"],
        "tags": ["1e", "Java"]
    },
    {
        "code": "DEV2",
        "name": "Développement 2e",
        "teachers": ["FPL", "SRV", "JLC"],
        "tags": ["2e", "Java"]
    },
    {
        "code": "INT1",
        "name": "Introduction 1e",
        "teachers": ["MCD", "NVS"],
        "tags": ["1e"]
    },
    {
        "code": "TMP56GATL",
        "name": "Ateliers Logiciel 3e",
        "teachers": ["FPL", "SRV"],
        "tags": ["3e", "Java", "Gestion"]
    },
    {
        "code": "STAGES",
        "name": "Stages",
        "teachers": ["DNA"],
        "tags": ["3e"]
    },
    {
        "code": "RE",
        "name": "Ressources étudiants",
        "teachers": ["ADT"],
        "tags": ["Administration"]
    },
    {
        "code": "SYS2",
        "name": "Système 2e",
        "teachers": ["MBA"],
        "tags": ["2e"]
    },
    {
        "code": "DVG2GCOB",
        "name": "Cobol 1e",
        "teachers": ["EFO", "HAL"],
        "tags": ["1e", "Gestion"]
    },
    {
        "code": "TMP56IRATL",
        "name": "Ateliers Logiciels Réseaux 3e",
        "teachers": ["NVS"],
        "tags": ["3e", "Réseaux"]
    }
].forEach(course => Models.Course.create(course));
        done();
    });
});

const badUser = {
    username: '',
    email: 'invisible@email.com',
    password: 'superpassword'
};

const badUsers = [{
    username: 'SRV',
    email: '',
    password: 'superpassword'
}, {
    username: 'FPL',
    email: 'pluquos@hotmail.com',
    password: 'superpassword'
}];

const user = {
    username: 'Johnny',
    email: 'Bogoss42@gmail.com',
    password: 'ImPosay',
    phoneNumber: '+32484283748'
};

const users = [{
    username: 'SRV',
    email: 'SRV@caramail.com',
    password: 'superpassword'
}, {
    username: 'FPL',
    email: 'pluquos@hotmail.com',
    password: 'superpassword'
}];

const tags = ['Theory', '2I12'];

describe('Controller.User', () => {
    describe('#post', () => {
        it('Should return 400 response because of invalid username', done => {
            const request = {
                method: 'POST',
                url: '/users',
                payload : badUser
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(400);
                done();
            });
        });
        it('Should return 400 response because of one invalid email in array', done => {
            const request = {
                method: 'POST',
                url: '/users',
                payload : badUsers
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(400);
                done();
            });
        });
        it('Should return the created user', done => {
            const request = {
                method: 'POST',
                url: '/users',
                payload : user
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(201);
                expect(response.username).equal(user.username);
                expect(response.email).equal(user.email);
                expect(response.password).not.equal(user.password);
                expect(response.phoneNumber).equal(user.phoneNumber);

                done();
            });
        });
        it('Should return 409 because user already exist', done => {
            const request = {
                method: 'POST',
                url: '/users',
                payload : user
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(409);

                done();
            });
        });
        it('Should return number of created users from array', done => {
            const request = {
                method: 'POST',
                url: '/users',
                payload : users
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(201);
                expect(response.count).equal(2);
                done();
            });
        });
    });
    describe('#get', () => {
        it('Should return 404 not found', done => {
            const request = {
                method: 'GET',
                url: '/users/IWillProbablyDoNotExist'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(404);
                done();
            });
        });
        it('Should return specified user', done => {
            const request = {
                method: 'GET',
                url: '/users/FPL'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.username).equal('FPL');
                expect(response.email).equal('pluquos@hotmail.com');
                done();
            });
        });
    });

    describe('#getAll', () => {
        it ('Should return 3 users', done => {

            const request = {
                method: 'GET',
                url: '/users'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response).to.be.an.array();
                expect(response).to.have.length(3);
                done();
            });
        });
    });

        describe('#addTags', () => {
        it('should return the user SRV', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/tags',
                payload : { tags: ['Laboratory'] }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(200);
                expect(response.username).equal('SRV');
                expect(response.tags).to.have.length(1);
                expect(response.tags).to.only.include('Laboratory')
                done();
            });
        });

        it('should return the user SRV', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/tags',
                payload : {
                    tags: tags
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(200);
                expect(response.username).equal('SRV');
                expect(response.tags).to.have.length(3);
                expect(response.tags).to.only.include(tags.concat('Laboratory'));
                done();
            });
        });
    });

});
