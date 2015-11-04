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
        require('../tags.json').forEach(tag => Models.Tag.create(tag));
        done()
    });
    
});

describe('Controller.Tag', () => {

    describe('#post()', () => {
        it('should return error because this tag already exist', done => {

            const request = {
                method: 'POST',
                url: '/tags',
                payload: {
                    name: 'Laboratory'
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
                url: '/tags',
                payload: {
                    name: '4_Security'
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.dataValues.name).to.equal(request.payload.name);
                done();
            });
        });
    });

    describe('#get()', () => {
        it('should return all tags', done => {

            const request = {
                method: 'GET',
                url: '/tags'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response).to.be.an.array();
                done();
            });
        });
        
        it('should return specific tag', done => {

            const request = {
                method: 'GET',
                url: '/tags',
                params : {
                    name : "Theory"
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                console.log(response);
                expect(response.name).to.equal('Theory');
                done();
            });
        });
        
        it('should throw an error because of inexistant tag', done => {

            const request = {
                method: 'GET',
                url: '/tags',
                params : {
                    name : "IWillProbablyNeverExist"
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
               // console.log(response);
                //expect(response.name).to.be.an.array(request.params.name);
                done();
            });
        });
    });
    
    describe('#delete()', () => {
        it('should return the deleted tag', done => {

            const request = {
                method: 'DELETE',
                url: '/tags',
                payload: {
                    name: '2I12'
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                //console.log(response);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
 
        it('should throw a error because of already deleted (or inexistant) tag', done => {

            const request = {
                method: 'DELETE',
                url: '/tags',
                payload: {
                    name: 'IWillProbablyNeverExist'
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                //console.log(response);
                done();
            });
        });
    });
});