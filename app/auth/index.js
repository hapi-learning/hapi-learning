'use strict';

exports.register = function (server, options, next) {

    const validateFunc = require('./validate-func')(server);

    server.method(require('./auth-methods').methods);

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.AUTH_KEY || 'dJa1O65Yb25MNjq451NxvZb4tAxWQla1',
        validateFunc: validateFunc,
        verifyOptions: {
            algorithms: ['HS256']
        }
    });

    server.auth.strategy('jwt-ignore-exp', 'jwt', {
        key: process.env.AUTH_KEY || 'dJa1O65Yb25MNjq451NxvZb4tAxWQla1',
        validateFunc: validateFunc,
        verifyOptions: {
            algorithms: ['HS256'],
            ignoreExpiration: true
        },
        urlKey: 'token'
    });

    server.auth.default('jwt');

    next();
};

exports.register.attributes = {
    name: 'hapi-learning-auth',
    version: require('../../package.json').version,
    dependencies: ['hapi-auth-jwt2']
};
