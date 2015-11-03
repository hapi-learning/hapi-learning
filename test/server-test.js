'use strict';

require('dotenv').load(); // Load .env file

const Glue  = require('glue');

let internals = {
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
            'hapi-auth-jwt2': [{select: ['api']}],
            './auth': [{select: ['api']}],
            './models': [
                {
                    select: ['api'],
                    options: {
                        dialect: 'sqlite',
                        storage: 'test_database.sqlite'
                    }
                }
            ],
            './controllers': [{select: ['api']}],
            './routes/api': [{select: ['api']}],
        }
    }
};


Glue.compose(internals.manifest, {relativeTo: 'app'}, (err, server) => {

    if (err) {
        console.log('server.register error :');
        throw err;
    }

    module.exports = server;
});


