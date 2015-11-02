'use strict'

exports.register = function (server, options, next) {

    // Routes for rest connection here

    next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: require('../../package.json').version,
    dependencies: ['controllers', 'models']
};
