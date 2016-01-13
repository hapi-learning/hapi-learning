'use strict';

const _ = require('lodash');

exports.register = function (server, options, next) {

    const pre = require('./prestart');
    const post = require('./poststart');

    _.each(pre, (func)  => server.ext('onPreStart', func));
    _.each(post, (func) => server.ext('onPostStart', func));

    return next();
};

exports.register.attributes = {
    name: 'hooks',
    version: require('../../package.json').version
};
