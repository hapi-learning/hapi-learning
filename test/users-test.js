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
    }).then(() => 
    {
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

const userUpdated = {
    email: 'Bogoss424@gmail.com',
    password: 'ImPosayy',
    firstName : 'Bo',
    lastName : 'Gosse',
    phoneNumber: '+32484283748'
};

const badUserPUT = {
    email: 'Bogoss424@gmail.com',
    firstName : 'Bo',
    lastName : 'Gosse',
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

const tags = [
    {name : 'Theory'},
    {name : '2I12'}
];

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

    describe('#delete', () => {
        it('should return 1 : number of deletations', done => {
            const request = {
                method: 'DELETE',
                url: '/users/Johnny'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(1);
                done();
            });
        });
        it('should return 0 : number of deletations', done => {
            const request = {
                method: 'DELETE',
                url: '/users/Johnny'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(0);
                done();
            });
        });
    });
    
    describe('#put', () => {
        it('should return 1 : number of updates', done => {
            const request = {
                method: 'PUT',
                url: '/users/Johnny',
                payload : userUpdated
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(1);
                done();
            });
        });
        it('should return 0 : number of updates', done => {
            const request = {
                method: 'PUT',
                url: '/users/IDoNotExist',
                payload : userUpdated
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(0);
                done();
            });
        });
    });
    
    describe('#patch', () => {
        it('should return 1 : number of updates', done => {
            const request = {
                method: 'PATCH',
                url: '/users/Johnny',
                payload : userUpdated
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(1);
                done();
            });
        });
        it('should return 1 because PATCH is not PUT (field not required)', done => {
            const request = {
                method: 'PATCH',
                url: '/users/Johnny',
                payload : badUserPUT
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(1);
                done();
            });
        });
        it('should return 0 : number of updates', done => {
            const request = {
                method: 'PATCH',
                url: '/users/IDoNotExist',
                payload : userUpdated
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(0);
                done();
            });
        });
    });
    
    describe('#put', () => {
        it('should return 1 : number of updates', done => {
            const request = {
                method: 'PUT',
                url: '/users/Johnny',
                payload : userUpdated
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(1);
                done();
            });
        });
        it('should return status code 400 because missing field', done => {
            const request = {
                method: 'PUT',
                url: '/users/Johnny',
                payload : badUserPUT
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.statusCode).equal(400);
                done();
            });
        });
        it('should return 0 : number of updates', done => {
            const request = {
                method: 'PUT',
                url: '/users/IDoNotExist',
                payload : userUpdated
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response.count).equal(0);
                done();
            });
        });
    });
    
    describe('#addTags', () => {
        it('should return the user SRV', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/tags',
                payload : {name : 'Laboratory'}
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(res.request.response.statusCode).equal(200);
                expect(response.username).equal('SRV');
                done();
            });
        });
        
        it('should return the user SRV', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/tags',
                payload : tags
            };

            server.inject(request, res => {
                const response = res.request.response.source;

                expect(res.request.response.statusCode).equal(200);
                expect(response.username).equal('SRV');
                done();
            });
        });
    });
    
    describe('#getTags', () => {
        it('should return empty array tags of specific user : 0', done => {
            const request = {
                method: 'GET',
                url: '/users/Johnny/tags'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response).to.be.an.array();
                expect(response).length(0);
                done();
            });
        });
        it('should return every tags of specific user : 3', done => {
            const request = {
                method: 'GET',
                url: '/users/SRV/tags'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                expect(response).to.be.an.array();
                expect(response).length(3);
                done();
            });});
    });
    
    describe('#addCourse', () => {
        it('should return statusCode 200, course has been added', done => {
            it('should return empty array tags of specific user : 0', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/courses/ATL'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                done();
            });
        });
        });
        it('should return statusCode 400, wrong parameter', done => {
            it('should return empty array tags of specific user : 0', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/courses/ATL'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                done();
            });
        });
        it('should return statusCode 404, user not found', done => {
            it('should return empty array tags of specific user : 0', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/courses/ATL'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                done();
            });
        });
        it('should return statusCode 404, course not found', done => {
            it('should return empty array tags of specific user : 0', done => {
            const request = {
                method: 'POST',
                url: '/users/SRV/courses/ATL'
            };

            server.inject(request, res => {
                const response = res.request.response.source;
                done();
            });
        });
    });
    
    describe('#removeCourse', () => {});
});
