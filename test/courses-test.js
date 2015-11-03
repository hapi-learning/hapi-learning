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


describe('Controller.Course', () => {
    describe('#post()', () => {
        it('should return the new added course', done => {

            const request = {
                method: 'POST',
                url: '/courses',
                payload: {
                    name: 'Ateliers Logiciel 3e',
                    code: 'ATL3',
                    description: 'A course',
                    teachers: ['SRV', 'FPL'],
                    tags: ['3e', 'Java']
                }
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.name).to.equal(request.payload.name);
                expect(response.code).to.equal(request.payload.code);
                expect(response.description).to.equal(request.payload.description);
                expect(response.teachers).to.be.an.array();
                expect(response.teachers).to.equal(request.teachers);
                expect(response.tags).to.be.an.array();
                expect(response.teachers).to.equal(request.tags);

                done();
            });
        });
    });
});


