'use strict';

require('dotenv').load(); // Load .env file

const Hapi  = require('hapi');
const Glue  = require('glue');
const _     = require('lodash');
const Path  = require('path');

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
            inert: [{'select': ['web']}],
            './models': [{'select' : ['api']}],
            './controllers': [{'select': ['api']}],
            './routes/api': [{'select': ['api']}],
            './routes/web': [{'select': ['web']}],
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

    server.start((err) => {
        if (err)
            throw err;
        else
            _.forEach(server.connections, (connection) => console.log('Server running on ' + connection.info.uri));

    });

});


