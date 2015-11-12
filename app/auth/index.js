'use strict';


/*
const payload = {
    id: result.id,
    username: result.username,
    email: result.email,
    role: result.Role.name,
    isAdmin: (result.Role.name === 'admin')
};

*/


exports.register = function (server, options, next) {

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.AUTH_KEY || 'dJa1O65Yb25MNjq451NxvZb4tAxWQla1',
        validateFunc: function(decoded, request, callback) {

            const User = server.plugins.models.models.User;

            User.findOne({
                where: {
                    id: decoded.id,
                    username: decoded.username,
                    email: decoded.email,
                }
            }).then(result => {
               if (result && result.Role.name === decoded.role) {
                   return callback(null, true, {scope: decoded.role});
               } else {
                   return callback(null, false);
               }
            });
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
