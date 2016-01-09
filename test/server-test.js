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
        plugins: {
            'hapi-qs': [{
                select: ['api']
            }],
            '../app/cache': [{select: ['api']}],
            '../app/utils/error' : [{select: ['api']}],
            'hapi-auth-jwt2': [{select: ['api']}],
            '../app/auth': [{select: ['api']}],
            '../app/models': [
                {
                    select: ['api'],
                    options: {
                        dialect: 'sqlite',
                        storage: 'test/test_database.sqlite',
                        logging: false
                    }
                }
            ],
            '../app/utils/mailers/mailers': [{
                select: ['api']
            }],
            '../app/utils/storage': [
                {
                    select: ['api'],
                    options: {
                        root: __dirname
                    }
                }],
            '../app/controllers': [{select: ['api']}],
            '../app/routes/api': [{select: ['api']}],
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
            ]
        }
    }
};


Glue.compose(internals.manifest, {relativeTo: __dirname}, (err, server) => {

    if (err) {
        console.log('server.register error :');
        throw err;
    }
    module.exports = server;
});


