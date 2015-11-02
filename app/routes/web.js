'use strict';


exports.register = function (server, options, next) {

    // RETURNS 404 PAGE IF REQUESTS IS INVALID
    server.ext('onPreResponse', (request, reply) => {
        let response = request.response;

        if (!response.isBoom)
        {
            reply.continue();
        }

        reply.file('404.html');
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
