'use strict';

const Hoek = require('hoek');
const JWT = require('jsonwebtoken');


exports.register = function (server, options, next) {

    server.method('parseAuthorization', (authorization) => {

        Hoek.assert(authorization, 'Authorization header is required');

        // Removes useless labels
        authorization = authorization.replace(/Bearer/gi, '').replace(/ /g, '');

        return {
            decoded: JWT.decode(authorization),
            token: authorization
        };
    });

    const validateFunc = function (decoded, request, callback) {

        const User = server.app.models.User;
        const Role = server.app.models.Role;
        const Cache = server.app.cache;

        const authorization = request.headers.authorization || request.query.token;

        const token = server.methods.parseAuthorization(authorization).token;
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
        const checkUser = function () {

            User.findOne({
                where: {
                    username: decoded.username
                },
                include: [{
                    model: Role
                }]
            }).then((result) => {

                if (result && result.Role.name === decoded.role) {
                    request.decoded = decoded;
                    request.token = token;
                    return callback(null, true, {
                        scope: [decoded.role, decoded.username]
                    });
                }

                return callback(null, false);

            });
        };


        // Check if the token is in the invalidated / deleted token cache
        // If it's not, check the user information
        Cache.get(invalidatedTokens, (invalidatedIgnored, invalidatedCached) => {

            if (invalidatedCached) {
                return callback(null, false);
            }

            Cache.get(deletedTokens, (deletedIgnored, deletedCached) => {

                if (deletedCached) {
                    return callback(null, false);
                }

                return checkUser();
            });
        });
    };

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
    dependencies: 'hapi-auth-jwt2'
};
