'use strict';

const Catbox = require('catbox');


exports.register = function (server, options, next) {

    options = options || {};

    const client = new Catbox.Client(require('catbox-memory'), options);

    server.app.cache = client;
    client.start(next);
};


exports.register.attributes = {
    name: 'cache',
    version: require('../../package.json').version
};
