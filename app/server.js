'use strict';

require('dotenv').load(); // Load .env file

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
                        storage: 'database.sqlite'
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
        force: true // drops all db and recreates them
       // logging: console.log
    })
    .then(() => {
        require('../roles.json').forEach(role => Models.Role.create(role));
        require('../users.json').forEach(user => Models.User.create(user));
        require('../tags.json').forEach(tag => Models.Tag.create(tag));
    });


    server.start((err) => {
        if (err) {
            throw err;
        } else {
            _.forEach(server.connections, (connection) => console.log('Server running on ' + connection.info.uri));
        }
    });

});
