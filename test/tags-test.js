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
    describe('#get()', () => {
        it('should return a specific tag', done => {

            const request = {
                method: 'GET',
                url: '/tags',
                params: {
                    name: 'niacinamide'
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                console.log(response);
                expect(response.name).to.equal(request.params.name);
                expect(response.name).to.equal('niacinamide');
                done();
            });
        });
    });
});

describe('Controller.Tag', () => {
    describe('#post()', () => {
        it('should return the new added tag', done => {

            const request = {
                method: 'POST',
                url: '/tags',
                payload: {
                    name: 'Laboratoire'
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                console.log(response);
                expect(response.name).to.equal(request.payload.name);
                done();
            });
        });
    });
});

describe('Controller.Tag', () => {
    describe('#getAll()', () => {
        it('should all tags', done => {

            const request = {
                method: 'GET',
                url: '/tags'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                console.log(response);
                expect(response).to.equal(
                    [
                        {"name":"niacinamide"},
                        {"name":"Cetylpyridinium Chloride"},
                        {"name":"NITROGEN"},
                        {"name":"Miconazole Nitrate"},
                        {"name":"CAMPHOR (NATURAL), MENTHOL"},
                        {"name":"Avobenzone Octinoxate"},
                        {"name":"levalbuterol hydrochloride"},
                        {"name":"Aluminum Chlorohydrate"},
                        {"name":"Nortriptyline Hydrochloride"},
                        {"name":"Warfarin Sodium"},
                        {"name":"chloroxylenol"},
                        {"name":"Glyburide"},
                        {"name":"oxycodone hydrochloride"},
                        {"name":"FERRUM PHOSPHORICUM"},
                        {"name":"Albuterol Sulfate"}
                    ]
                );
                done();
            });
        });
    });
});