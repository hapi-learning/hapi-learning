'use strict';

const _ = require('lodash');

const internals = {};

internals.connections = function (server, next) {

    _.each(server.connections, (connection) => {

        console.log('Server running on:', connection.info.uri);
    });

    next();
};

exports = module.exports = [
    internals.connections
];

