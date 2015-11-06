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

const badUser = {
    username: '',
    email: 'invisible@email.com',
    password: 'superpassword'
};

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
    });
    describe('#get', () => {
        it('Should return the course with tags and titulars', done => {
            const request = {
                method: 'GET',
                url: '/users/SRV'
            };

            server.inject(request, res => {
                const response = res.request.response.source;

                done();
            });
        });

        it ('Should return code 400 - bad validation', done => {
            const request = {
                method: 'GET',
                url: '/users/9SRV'
            };

            server.inject(request, res => {
                const response = res.request.response.source;

                done();
            });
        });
    });

    describe('#getAll', () => {
        it ('Should return 3 courses', done => {
            
            const request = {
                method: 'GET',
                url: '/users'
            };

            server.inject(request, res => {
                const response = res.request.response.source;

                done();
            });
        });
    });

});
