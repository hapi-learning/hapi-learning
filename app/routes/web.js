'use strict';

exports.register = function (server, options, next) {

    // Routes for web connection here

    next();
};

exports.register.attributes = {
  name: 'web-routes',
    version: require('../../package.json').version
};
