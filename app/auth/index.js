'use strict';

const Hoek = require('hoek');
const JWT = require('jsonwebtoken');


exports.register = function (server, options, next) {

    server.method('parseAuthorization', function(authorization) {
        Hoek.assert(authorization, 'Authorization header is required');

        // Removes useless labels
        authorization = authorization.replace(/Bearer/gi, '').replace(/ /g, '')

        return {
            decoded: JWT.decode(authorization),
            token: authorization
        };
    });

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.AUTH_KEY || 'dJa1O65Yb25MNjq451NxvZb4tAxWQla1',
        validateFunc: function(decoded, request, callback) {

            const User = server.plugins.models.models.User;
            const Role = server.plugins.models.models.Role;
            const Cache = server.plugins.cache.cache;

            const token = server.methods.parseAuthorization(request.headers.authorization).token;

            // Key to deleted tokens
            const deletedTokens = {
                segment: 'DeletedTokens',
                id: token
            };

            // Key to invalidated tokens
            const invalidatedTokens = {
                segment: 'InvalidatedTokens',
                id: decoded.username
            };


            // Check the user informations
            const checkUser = function() {
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
                       request.decoded = decoded;
                       request.token = token;
                       return callback(null, true, {scope: [decoded.role, decoded.username]});
                   } else {
                       return callback(null, false);
                   }
                });
            };


            // Check if the token is in the invalidated / deleted token cache
            // If it's not, check the user information
            Cache.get(invalidatedTokens, function(err, cached) {
                if (cached) {
                    return callback(null, false);
                } else {
                    Cache.get(deletedTokens, function(err, cached) {
                        if (cached) {
                            return callback(null, false);
                        } else {
                            checkUser();
                        }
                    });
                }
            });



        },
        verifyOptions: {
            algorithms: [ 'HS256' ]
        }
    });

    server.auth.default('jwt');

    next();
};

exports.register.attributes = {
    name: 'hapi-learning-auth',
    version: require('../../package.json').version,
    dependencies: 'hapi-auth-jwt2'
};
