'use strict';

const Hoek = require('hoek');
const P = require('bluebird');
const _ = require('lodash');


exports.register = function (server, options, next) {

    const invalidatedSegment = 'InvalidatedTokens';

    server.method('parseAuthorization', (authorization) => {

        Hoek.assert(authorization, 'Authorization header is required');
        return authorization.replace(/Bearer/gi, '').replace(/ /g, '');
    });

    server.method('isInvalidated', (user, token) => {

        const Cache = server.app.cache;


        return new P((resolve, reject) => {

            Cache.get({
                segment: invalidatedSegment,
                id: user
            }, (err, cached) => {

                if (err) {
                    return reject(err);
                }

                if (!cached) {
                    return resolve(false);
                }

                return resolve(_.includes(cached.item, token));
            });
        });
    });

    server.method('invalidateToken', (user, token, ttl, callback) => {

        Hoek.assert(callback, 'callback required');

        const Cache = server.app.cache;

        const key = {
            segment: invalidatedSegment,
            id: user
        };

        Cache.get(key, (err, cached) => {

            if (err) {
                throw err;
            }

            let tokens = [token];

            if (cached) {
                tokens = _.concat(tokens, cached.item);
            }

            Cache.set({
                segment: invalidatedSegment,
                id: user
            }, tokens, ttl, callback);
        });

    });

    const validateFunc = function (decoded, request, callback) {

        const User = server.app.models.User;
        const Role = server.app.models.Role;
        const authorization = request.headers.authorization || request.query.token;
        const token = server.methods.parseAuthorization(authorization);

        server.methods.isInvalidated(decoded.username, token)
        .then((invalidated) => {

            if (invalidated) {
                return callback(null, false);
            }

            User.findOne({
                where: {
                    username: decoded.username
                },
                include: [{
                    model: Role
                }]
            })
            .then((result) => {

                if (result && result.Role.name === decoded.role) {
                    return callback(null, true, {
                        user: decoded,
                        token: token,
                        scope: [decoded.role, decoded.username]
                    });
                }

                return callback(null, false);

            });

        })
        .catch((err) => callback(err, false));
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
