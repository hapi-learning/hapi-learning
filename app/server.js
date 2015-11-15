'use strict';

require('dotenv').load(); // Load .env file

require('hoek').assert(process.env.UPLOAD_MAX);

const Glue = require('glue');
const _ = require('lodash');
const Path = require('path');

let internals = {
    manifest: {
        connections: [{
            host: process.env.WEB_HOST || 'localhost',
            port: process.env.WEB_PORT || 8080,
            routes: {
                cors: true,
                files: {
                    relativeTo: Path.join(__dirname, 'public')
                }
            },
            labels: ['web']
        }, {
            host: process.env.API_HOST || 'localhost',
            port: process.env.API_PORT || 8088,
            routes: {
                cors: true
            },
            labels: ['api']
        }],
        plugins: {
           './cache': [{select: ['api']}],
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
            './auth': [{select: ['api']}],
            inert: [{
                select: ['api', 'web']
            }],
            './models': [
                {
                    select: ['api'],
                    options: {
                        connection: 'api',
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
            },
            tv: {
                host: process.env.API_HOST || 'localhost'
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

                process.on('SIGINT', function() {
                    console.log('\nStopping server...');
                    server.stop({timeout: 10000}, err => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Server stopped successfuly !');
                        }

                        process.exit();
                    });
                });

                _.forEach(server.connections, (connection) => console.log('Server running on ' + connection.info.uri));

                // INIT DATA FOR TEST PURPOSES

                const Wreck = require('wreck');
                const roles = require('../resources/roles.json');
                const users = require('../resources/users.json');
                const tags  = require('../resources/tags.json');
                const permissions = require('../resources/permissions.json');
                const teachers = require('../resources/all_teachers.json');
                const courses = require('../resources/all_courses.json');


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
                    _.forEach(users, user => post('http://' + (process.env.HOST || 'localhost') + ':8088/users', user, addTeachers));
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
