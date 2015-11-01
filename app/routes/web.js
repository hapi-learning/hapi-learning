'use strict';


exports.register = function (server, options, next) {

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
