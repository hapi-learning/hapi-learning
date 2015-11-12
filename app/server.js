'use strict';

require('dotenv').load(); // Load .env file

require('hoek').assert(process.env.UPLOAD_MAX);

const Glue = require('glue');
const _ = require('lodash');
const Path = require('path');

let internals = {
    manifest: {
        connections: [{
            host: process.env.HOST || 'localhost',
            port: process.env.PORT || 8080,
            routes: {
                cors: true,
                files: {
                    relativeTo: Path.join(__dirname, 'public')
                }
            },
            labels: ['web']
        }, {
            host: process.env.HOST || 'localhost',
            port: process.env.API_PORT || 8088,
            routes: {
                cors: true
            },
            labels: ['api']
        }],
        plugins: {
            './utils/error' : [{select: ['api']}],
            './utils/storage': [
                {
                    select: ['api'],
                    options: {
                        root: __dirname,
                        documents: 'documents',
                        courses: 'courses',
                        storage: 'storage',
                        test: false
                    }
                }],
            'hapi-auth-jwt2': [{
                select: ['api']
            }],
            './auth': [{
                select: ['api'],
                options: {
                    setDefault: false
                }
            }],
            inert: [{
                select: ['api', 'web']
            }],
            './models': [
                {
                    select: ['api'],
                    options: {
                        name: null,
                        username: null,
                        password: null,
                        host: null,
                        dialect: 'sqlite',
                        storage: 'database.sqlite',
                        logging: console.log
                    }
                }
            ],
            './controllers': [{
                select: ['api']
            }],
            './routes/api': [{
                select: ['api']
            }],
            './routes/web': [{
                select: ['web']
            }],
            'hapi-pagination': [
                {
                    select: ['api'],
                    options: {
                        routes: {
                            include: ['/courses', '/users']
                        },
                        meta: {
                            self: {
                                active: false
                            },
                            last: {
                                active: false
                            },
                            previous: {
                                active: false
                            },
                            next: {
                                active: false
                            },
                            first: {
                                active: false
                            }
                        }
                    }
                }
            ],
            vision: [{
                select: ['api']
            }],
            lout: [{
                select: ['api']
            }],
            good: {
                reporters: [
                    {
                        'reporter': 'good-console',
                        'events': {
                            'ops': '*',
                            'log': '*',
                            'response': '*',
                            'request': '*',
                            'error': '*'
                        }
                    }
                ]
            }
        }
    }
};


Glue.compose(internals.manifest, {relativeTo: __dirname}, (err, server) => {

    if (err) {
        console.log('server.register error :');
        throw err;
    }

    var Models = server.plugins.models.models;

    Models.sequelize.sync({
        force: false // drops all db and recreates them
       // logging: console.log
    })
    .then(() => {

        server.start((err) => {
            if (err) {
                throw err;
            } else {
                _.forEach(server.connections, (connection) => console.log('Server running on ' + connection.info.uri));



                // INIT DATA FOR TEST PURPOSES

                const Wreck = require('wreck');
                const roles = require('../resources/roles.json');
                const users = require('../resources/users.json');
                const tags  = require('../resources/tags.json');
                const permissions = require('../resources/permissions.json');
                const teachers = require('../resources/teachers.json');
                const courses = require('../resources/courses.json');


                const post = function(url, payload) {
                    Wreck.post(url, { payload: JSON.stringify(payload) }, () => {});
                };

                const addCourses = function() {
                    _.forEach(courses, course => post('http://localhost:8088/courses', course));
                };

                const addTeachers = function() {
                    _.forEach(teachers, teacher => post('http://localhost:8088/users', teacher));
                };

               /* const addUsers = function() {
                    _.forEach(users, user => post('http://localhost:8088/users', user, addTeachers));
                };*/

                const addTags = function() {
                    _.forEach(tags, tag => post('http://localhost:8088/tags', tag));
                };

                const addRoles = function() {
                    _.forEach(roles, role => post('http://localhost:8088/roles', role));
                };


                addRoles();
                addTags();
                addTeachers();
                setTimeout(addCourses, 1000); // just for test.

            }
        });

    });
});
