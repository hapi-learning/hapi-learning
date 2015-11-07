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
            '../app/utils/error' : [{select: ['api']}],
            '../app/utils/storage': [
                {
                    select: ['api'],
                    options: {
                        root: __dirname,
                        test: true
                    }
                }],
            'hapi-auth-jwt2': [{select: ['api']}],
            '../app/auth': [{
                select: ['api'],
                options: {
                    setDefault: false
                }
            }],
            '../app/models': [
                {
                    select: ['api'],
                    options: {
                        dialect: 'sqlite',
                        storage: 'test_database.sqlite',
                        logging: false
                    }
                }
            ],
            '../app/controllers': [{select: ['api']}],
            '../app/routes/api': [{select: ['api']}],
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


