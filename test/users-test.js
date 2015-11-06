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

describe('Controller.User', () => {
    describe('#post', () => {
        it('Should return 422 response because of invalid username', done => {});
        it('Should return the created user', done => {});
        it('Should return 409 because user already exist', done => {});
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
