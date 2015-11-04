'use strict';


exports.register = function (server, options, next) {

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.AUTH_KEY || 'dJa1O65Yb25MNjq451NxvZb4tAxWQla1',
        validateFunc: function(decoded, request, callback) {
            return callback(null, true, {scope: decoded.role}); // verification ok(err, isValid, credential);
        },
        verifyOptions: {
            algorithms: [ 'HS256' ]
        }
    });

    if (options.setDefault) {
        server.auth.default('jwt');
    }

    next();
};

exports.register.attributes = {
    name: 'hapi-learning-auth',
    version: require('../../package.json').version,
    dependencies: 'hapi-auth-jwt2'
};
