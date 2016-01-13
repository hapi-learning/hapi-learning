'use strict';

const internals = {};

internals.connections = function (server, next) {

    console.log('Server running on:', server.info.uri);
};

exports.register = function (server, options, next) {

    server.ext('onPostStart', internals.connections);
    return next();
};

exports.register.attributes = {
    name: 'hooks',
    version: require('../../package.json').version
};
