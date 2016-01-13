'use strict';

require('dotenv').load(); // Load .env file

const Glue  = require('glue');

const internals = {
    manifest: {
        connections: [{
            host: process.env.HOST || 'localhost',
            port: process.env.API_PORT || 8088,
            routes: {
                cors: true
            },
            labels: ['api']
        }],
        registrations: [
            {
                plugin: {
                    register: 'hapi-qs'
                }
            },
            {
                plugin: {
                    register: './cache'
                }
            },
            {
                plugin: {
                    register: './utils/error'
                }
            },
            {
                plugin: {
                    register: 'hapi-auth-jwt2'
                }
            },
            {
                plugin: {
                    register: './auth'
                }
            },
            {
                plugin: {
                    register: 'inert'
                }
            },
            {
                plugin: {
                    register: './models',
                    options: {
                        dialect: 'sqlite',
                        storage: 'test/test_database.sqlite',
                        logging: false
                    }
                }
            },
            {
                plugin: {
                    register: './utils/storage',
                    options: {
                        root: __dirname
                    }
                }
            },
            {
                plugin: {
                    register: './utils/mailers/mailers'
                }
            },
            {
                plugin: {
                    register: './controllers'
                }
            },
            {
                plugin: {
                    register: './routes/api'
                }
            },
            {
                plugin: {
                    register: 'hapi-pagination',
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
            }
        ]
    }
};


Glue.compose(internals.manifest, { relativeTo: require('path').join(__dirname, '../app') }, (err, server) => {

    if (err) {
        console.log('server.register error :');
        throw err;
    }

    module.exports = server;
});


