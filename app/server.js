'use strict';

require('dotenv').load(); // Load .env file

require('hoek').assert(process.env.UPLOAD_MAX);

const Glue = require('glue');
const Path = require('path');
const Program = require('commander');
const Rmdir = require('rmdir');

Program
    .version(require('../package.json').version)
    .option('-T', '--test-data', 'Generate test data')
    .option('-f, --flush', 'Reset storage and database')
    .option('-v, --verbose', 'Verbose mode')
    .option('-P, --prod', 'Production mode')
    .parse(process.argv);


const internals = {};


internals.manifest = {
    connections: [{
        host: process.env.WEB_HOST || 'localhost',
        port: process.env.WEB_PORT || 8080,
        routes: {
            cors: process.env.WEB_CORS === 'true',
            files: {
                relativeTo: Path.join(__dirname, Program.prod ? 'dist' : 'public')
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
    registrations: [
        {
            plugin: {
                register: './utils/on-exit'
            },
            options: {
                select: ['api', 'web']
            }
        },
        {
            plugin: {
                register: './hooks/postStart'
            },
            options: {
                select: ['api', 'web']
            }
        },
        {
            plugin: {
                register: 'hapi-qs'
            },
            options: {
                select: ['api', 'web']
            }
        },
        {
            plugin: {
                register: './cache'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './utils/error'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: 'hapi-auth-jwt2'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './auth'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: 'inert'
            },
            options: {
                select: ['api', 'web']
            }
        },
        {
            plugin: {
                register: './models',
                options: {
                    name: process.env.DB_NAME || null,
                    username: process.env.DB_USERNAME || null,
                    password: process.env.DB_PASSWORD || null,
                    host: process.env.DB_HOST || null,
                    dialect: process.env.DB_DIALECT || null,
                    storage: process.env.DB_STORAGE || null,
                    logging: Program.verbose ? console.log : false,
                    flush: Program.flush
                }
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './utils/storage',
                options: {
                    root: process.env.STORAGE_PATH || __dirname,
                    documents: 'documents',
                    courses: 'courses',
                    storage: 'storage'
                }
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './utils/mailers/mailers'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './controllers'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './routes/api'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './routes/web'
            },
            options: {
                select: ['web']
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
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: 'vision'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: 'lout'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: 'good',
                options: {
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
        },
        {
            plugin: {
                register: 'tv',
                options: {
                    host: process.env.API_HOST || 'localhost'
                }
            }
        }
    ]
};



const compose = function () {

    Glue.compose(internals.manifest, { relativeTo: __dirname }, (err, server) => {

        if (err) {
            console.error('server.register error :');
            throw err;
        }

        server.start((err) => {


            if (err) {
                throw err;
            }
        });

    });
};


// TODO -- move this to prestart
if (Program.flush) {
    Rmdir(Path.join(process.env.STORAGE_PATH || __dirname, 'storage'), compose);
}
else {
    compose();
}
