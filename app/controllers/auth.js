'use strict';

const Joi = require('joi');
const JWT = require('jsonwebtoken');
const Bcrypt = require('bcrypt-nodejs');
const Boom = require('boom');

/**
 * The login handler.
 * Logins and returns a token or 401 unauthorized if username and/or password
 * is invalid.
 * If the user has previously logout (and invalidate his token). The handler
 * first try to get this token from the invalidated tokens stored in the cache.
 * If the cache hit and the time to live is over 30 minutes, this token is returned.
 *
 * The username OR the email can be given to login (both being unique id's).
 */
exports.login = {
    description: 'Login and returns a token',
    auth: false,
    validate: {
        payload: Joi.object().keys({
            username: Joi.string().description('The username'),
            email: Joi.string().email().description('The email'),
            password: Joi.string().required().description('The password')
        }).xor('username', 'email')
    },
    handler: function (request, reply) {
        const User = this.models.User;
        const Role = this.models.Role;
        const Cache = this.cache;

        const where = {};
        if (request.payload.username) {
            where.username = { $eq: request.payload.username };
        } else {
            where.email = { $eq: request.payload.email };
        }

        // Check if the user is in the database.
        // If so, compare the password given in the payload
        // with the hashed password in the database
        User.findOne({
            include: [{
                model: Role
            }],
            where: where
        })
        .then(result => {

            // If the user exists and the passwords match
            if (result && Bcrypt.compareSync(request.payload.password,
                                             result.password))
            {
                const key = {
                    segment: 'InvalidatedTokens',
                    id: result.get('username')
                };

                // Try to get the token from the cache.
                // If the token is in the cache and
                // expiration date is at least 30 minutes
                // from now, returns the token in the cache
                // then drop the token from the cache.
                Cache.get(key, function(err, cached) {

                    if (cached && cached.ttl > 1800000) {
                        Cache.drop(key, function(err) {
                            return reply({ token: cached.item });
                        });
                    } else {

                        // Generate the payload based on user data
                        const payload = {
                            id: result.id,
                            username: result.username,
                            email: result.email,
                            role: result.Role.name,
                            isAdmin: (result.Role.name === 'admin')
                        };

                        // Sign the token
                        const token = {
                            token: JWT.sign(payload,
                                            process.env.AUTH_KEY, {
                                                expiresIn: 7200
                                            })
                        };

                        return reply(token);
                    }
                });
            }
            else
            {
                reply(Boom.unauthorized('Invalid username and/or password'));
            }
        });
    }
};

/**
 * Invalidate the token.
 * Add the token to the "invalidated tokens" cache.
 * If another token of the user is already in the cache
 * the former is added to the "deleted tokens" cache.
 * The invalidated tokens cache can still be retrieved with a login.
 * The deleted tokens cannot be retrieved.
 */
exports.logout = {
    description: 'Logout and revoke the token',
    handler: function (request, reply) {

        const Cache = this.cache;

        const payload = request.decoded;

        const key = {
            segment: 'InvalidatedTokens',
            id: payload.username
        };

        // Calculate time to live
        // Math.abs in case of the expiration date expires just after the
        // token validation and just before this handler
        const ttl = Math.abs(((payload.iat + 7200) * 1000) - Date.now());
        const token = request.token;

        const cacheToken = function() {
            // Invalidate the token by adding it to the cache.
            Cache.set(key, token, ttl, function(err) {
                if (err) {
                    return reply.badImplementation(err);
                } else {
                    return reply().code(204);
                }
            });
        };

        // If user already has a token in the invalidated token -
        // Creates a entry in another segment of the cache (cannot be accessed again)
        // This token is then marked to 'deletion'.
        Cache.get(key, function(err, cached) {
            if (cached) {

                const keyToDelete = {
                    segment: 'DeletedTokens',
                    id: cached.item
                };

                Cache.set(keyToDelete, cached.item, cached.ttl, function(err) {});
            }

            cacheToken();
        });
    }
};

/**
 * Parses the token and returns
 * the user informations.
 */
exports.me = {
    description: 'Get current user',
    handler: function (request, reply) {

        const User = this.models.User;
        const payload = request.decoded;

        User.findOne({
            where: { username: { $eq: payload.username } },
            attributes: { exclude: ['password', 'deleted_at'] }
        }).then(result => {
            if (result) {
                return reply(result);
            } else {
                return reply.badImplementation();
            }
        }).catch(err => reply.badImplementation(err));
    }
};
