'use strict';

require('dotenv').load(); // Load .env file

require('hoek').assert(process.env.UPLOAD_MAX);

const Glue = require('glue');
const _ = require('lodash');
const Path = require('path');
const P = require('bluebird');
const program = require('commander');
const rmdir = require('rmdir');

program
    .version(require('../package.json').version)
    .option('-f, --flush', 'Reset storage and database')
    .option('-v, --verbose', 'Verbose mode')
    .option('-P, --prod', 'Production mode')
    .parse(process.argv);


const internals = {
    manifest: {
        connections: [{
            host: process.env.WEB_HOST || 'localhost',
            port: process.env.WEB_PORT || 8080,
            routes: {
                cors: process.env.WEB_CORS === 'true',
                files: {
                    relativeTo: Path.join(__dirname, program.prod ? 'dist' : 'public')
                }
            },
            labels: ['web']
        }, {
            host: process.env.API_HOST || 'localhost',
            port: process.env.API_PORT || 8088,
            routes: {
                cors: process.env.API_CORS === 'true'
            },
            labels: ['api']
        }],
        plugins: {
           './cache': [{select: ['api']}],
            './utils/error' : [{select: ['api']}],
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
                        name: process.env.DB_NAME || null,
                        username: process.env.DB_USERNAME || null,
                        password: process.env.DB_PASSWORD || null,
                        host: process.env.DB_HOST || null,
                        dialect: process.env.DB_DIALECT || null,
                        storage: process.env.DB_STORAGE || null,
                        logging: program.verbose ? console.log : false
                    }
                }
            ],
            './utils/storage': [
                {
                    select: ['api'],
                    options: {
                        root: process.env.STORAGE_PATH || __dirname,
                        documents: 'documents',
                        courses: 'courses',
                        storage: 'storage'
                    }
                }],
            './utils/mail-notifier/mail-notifier': [{select : ['api'] }],
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
                            include: ['/courses', '/users', '/news', '/me/news', '/courses/{id}/news']
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


const initializeData = function(server, Models) {

    const Wreck = require('wreck');
    const User = Models.User;
    const baseUrl = server.select('api').info.uri;

    const users = require('../resources/users.json');
    const tags  = require('../resources/tags.json');
    const teachers = require('../resources/all_teachers.json');
    const courses = require('../resources/all_courses.json');
    const news = require('../resources/news.json');

    User.create({
        username: 'admin',
        password: 'admin',
        role_id: 1,
        email: 'admin@admin.com',
        firstName: 'admin',
        lastName: 'admin'
    }).then(function() {
        Wreck.post(baseUrl + '/login', {
            payload: JSON.stringify({
                username: 'admin',
                password: 'admin'
            })
        }, function(err, response, payload) {
            const token = JSON.parse(payload.toString()).token;

            const post = function(url, payload) {
                return new P(function(resolve, reject) {
                    Wreck.post(baseUrl + url, {
                        payload: JSON.stringify(payload),
                        headers: {
                            Authorization: token
                        }
                    }, (err, r, p) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            };

            const addCourses = function() {
                return P.all(_.map(courses, course => post('/courses', course)));
            };

            const addTeachers = function() {
                return P.all(_.map(teachers, teacher => post('/users', teacher)));
            };

            const addTags = function() {
                return P.all(_.map(tags, tag => post('/tags', tag)));
            };

            const addNews = function() {
                return P.all(_.map(news, n => post('/news', n)));
            };

            addTags().then(function() {
                addTeachers().then(function() {
                    addCourses().then(function() {
                        addNews();
                    });
                });
            });

        });
    }).catch(console.log);
}



const compose = function() {
    Glue.compose(internals.manifest, {relativeTo: __dirname}, (err, server) => {

        if (err) {
            console.log('server.register error :');
            throw err;
        }

         process.on('SIGINT', function() {
            console.log('Stopping server...');
            server.plugins.cache.cache.stop();
            server.stop({timeout: 10}, err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Server stopped successfuly !');
                }
                process.exit();
            });
        });

        const Models = server.plugins.models.models;

        Models.sequelize.sync({
            force: program.flush,
            logging: program.verbose ? console.log : false
        })
        .then(() => {

            server.start((err) => {
                if (err) {
                    throw err;
                } else {

                    _.forEach(server.connections,
                              (connection) => console.log('Server running on ' + connection.info.uri));

                    // INIT DATA FOR TEST PURPOSES

                    // initialize roles
                    const Role = Models.Role;
                    const roles = _.map(require('../resources/roles.json'), role => Role.create(role));

                    Promise.all(roles).then(function() {
                        if (program.flush) {
                            initializeData(server, Models);
                        }
                    })
                    .catch(function() {});
                }

            });
        });
    });
}

if (program.flush) {
    rmdir(Path.join(process.env.STORAGE_PATH || __dirname, 'storage'), compose);
} else {
    compose();
}
