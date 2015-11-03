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

const request = {
    method: 'POST',
    url: '/courses',
    payload: {
        name: 'Ateliers Logiciel 3e',
        code: 'ATL3',
        description: 'A course',
        titulars: ['SRV', 'FPL'],
        tags: ['3e', 'Java']
    }
};

describe('Controller.Course', () => {
    describe('#post()', () => {
        it('should return 422 response because of invalid titulars/tags', done => {

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).to.equal(422);

                done();
            });
        });

        it('should return the new added course', done => {
            const Models = server.plugins.models.models;
            const User = Models.User;
            const Tag = Models.Tag;

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
            }]

            const createUsers = () => users.forEach(u => User.create(u));
            const createTags  = () => tags.forEach(t => Tag.create(t));

            Promise.all([createUsers(), createTags()])
            .then(() => {
                server.inject(request, res => {
                    const response = res.request.response.source;
                    console.log('\n\n\n response ---------- ' + response);
                    console.log(response.code);
                   //expect(response.name).to.equal(request.payload.name);
                  // expect(response.code).to.equal(request.payload.code);
                   expect(response.description).to.equal(request.payload.description);
          /*          expect(response.titulars).to.be.an.array();
                    expect(response.titulars).to.equal(request.teachers);
                    expect(response.tags).to.be.an.array();
                    expect(response.titulars).to.equal(request.tags);*/

                    done();
                });
            });
        });
    });
});


