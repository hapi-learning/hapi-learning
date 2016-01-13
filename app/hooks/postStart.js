'use strict';

const _ = require('lodash');

const internals = {};

internals.connections = function (server, next) {

    _.each(server.connections, (connection) => {

        console.log('Server running on:', connection.info.uri);
    });

    next();
};

exports.register = function (server, options, next) {

    server.ext('onPostStart', internals.connections);
    return next();
};

exports.register.attributes = {
    name: 'hooks',
    version: require('../../package.json').version
};
