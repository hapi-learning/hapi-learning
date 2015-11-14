'use strict';


exports.register = function (server, options, next) {

    // RETURNS 404 PAGE IF REQUESTS IS INVALID
    server.ext('onPreResponse', (request, reply) => {
        let response = request.response;

        if (!response.isBoom)
        {
            return reply.continue();
        }

        return reply.file('404.html');
    });

    server.route({
        method: 'GET',
        path: '/api',
        handler: function(request, reply) {
            return reply({
                api: request.server.select('api').info.uri
            })
        }
    });

    server.route({
        method: 'GET',
        path: '/apitest',
        handler: function(request, reply) {
            return reply({
                info: request.server.select('api').info,
                server: request.server.select('api')
            })
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