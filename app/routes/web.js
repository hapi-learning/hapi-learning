'use strict';


exports.register = function (server, options, next) {

    // RETURNS 404 PAGE IF REQUESTS IS INVALID
    server.ext('onPreResponse', (request, reply) => {

        const response = request.response;

        if (!response.isBoom) {
            return reply.continue();
        }

        return reply.file('404.html');
    });

    server.route({
        method: 'GET',
        path: '/api',
        config: {
            cache: {
                expiresIn: 1000 * 60 * 5, // 5 minutes
                privacy: 'private'
            },
            handler: function (request, reply) {

                return reply({
                    api: request.server.select('api').info.uri
                });
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.'
            }
        }
    });


    next();
};

exports.register.attributes = {
    name: 'web-routes',
    version: require('../../package.json').version
};
