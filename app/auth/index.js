'use strict';

const Hoek = require('hoek');
const JWT = require('jsonwebtoken');


exports.register = function (server, options, next) {

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.AUTH_KEY || 'dJa1O65Yb25MNjq451NxvZb4tAxWQla1',
        validateFunc: function(decoded, request, callback) {

            const User = server.plugins.models.models.User;
            const Role = server.plugins.models.models.Role;

            User.findOne({
                where: {
                    id: decoded.id,
                    username: decoded.username,
                    email: decoded.email,
                },
                include: [{
                    model: Role
                }]
            }).then(result => {
               if (result && result.Role.name === decoded.role) {
                   return callback(null, true, {scope: [decoded.role, decoded.username]});
               } else {
                   return callback(null, false);
               }
            });
        },
        verifyOptions: {
            algorithms: [ 'HS256' ]
        }
    });


    server.method('parseAuthorization', function(authorization) {
        Hoek.assert(authorization, 'Authorization header is required');

        // Removes useless labels
        authorization = authorization.replace(/Bearer/gi, '').replace(/ /g, '')

        const payload = JWT.decode(authorization);

        return {
            decoded: JWT.decode(authorization),
            token: authorization
        };
    });

    server.auth.default('jwt');

    next();
};

exports.register.attributes = {
    name: 'hapi-learning-auth',
    version: require('../../package.json').version,
    dependencies: 'hapi-auth-jwt2'
};
