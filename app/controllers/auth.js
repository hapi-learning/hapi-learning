'use strict';

const Joi = require('joi');
const JWT = require('jsonwebtoken');
const Bcrypt = require('bcrypt-nodejs');
const Uuid = require('node-uuid');
const Boom = require('boom');
const Utils = require('../utils/sequelize');
const _ = require('lodash');

/**
 * The login handler.
 * Logins and returns a token or 401 unauthorized if username and/or password
 * is invalid.
 * If the user has previously logout (and invalidate his token). The handler
 * first try to get this token from the invalidated tokens stored in the cache.
 * If the cache hit and the time to live is over 1 hour, this token is returned.
 *
 * The username OR the email can be given to login (both being unique id's).
 */


/**
 * @api {post} /login Authentificate
 * @apiName Login
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl -X POST http://localhost/login -H "Content-Type: application/json" \
             -d '{ "username": "user", "password": "password" }'
 *
 * @apiPermission all users.
 *
 * @apiDescription You have to provide the username OR the email. <br/>
 * After the login, you have to provide the private token returned
 * by the login in EVERY request in the Authorization header.
 *
 * @apiParam (payload) {String} [username] The username.
 * @apiParam (payload) {String} [email] The email.
 * @apiParam (payload) {String} password The password.
 *
 * @apiSuccess {json} 200 The private token.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Bad credentials.
 *
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
            where.username = {
                $eq: request.payload.username
            };
        } else {
            where.email = {
                $eq: request.payload.email
            };
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
                        result.password)) {
                    const key = {
                        segment: 'InvalidatedTokens',
                        id: result.get('username')
                    };

                    // Try to get the token from the cache.
                    // If the token is in the cache and
                    // expiration date is at least 30 minutes
                    // from now, returns the token in the cache
                    // then drop the token from the cache.
                    Cache.get(key, function (err, cached) {

                        if (cached && cached.ttl > 3600000) {
                            Cache.drop(key, function (err) {
                                return reply({
                                    token: cached.item
                                });
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
                                token: JWT.sign(payload, process.env.AUTH_KEY, {
                                        expiresIn: parseInt(process.env.TOKEN_EXP) || 7200
                                    })
                            };

                            return reply(token);
                        }
                    });
                } else {
                    reply(Boom.unauthorized('Invalid username and/or password'));
                }
            });
    }
};

exports.forgot = {
    description: 'Forgot password request',
    auth: false,
    validate: {
        payload: {
            email: Joi.string().email().required()
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;
        const PRR  = this.models.PasswordResetRequest;
        const Mailers = this.mailers;

        User.findOne({
            attributes: {
                exclude: ['password']
            },
            where: {
                email: request.payload.email
            }
        }).then(function(user) {
            if (user) {

                const uuid = Uuid.v1();

                // No need to wait for this
                user.createPasswordResetRequest({
                    guid: uuid
                });

                const uri = request.server.select('web').info.uri + '/#/reset/' + uuid;
                return Mailers.sendPasswordReset(user, uri);
            } else {
                throw {}; // No need for an error - finally block
            }
        }).finally(function() {
            return reply().code(202);
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

/**
 * @api {post} /logout Logout
 * @apiName Logout
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl -X POST http://localhost/logout -H "Authorization: private_token"
 *
 * @apiPermission all users.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 204 No content
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
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

        const cacheToken = function () {
            // Invalidate the token by adding it to the cache.
            Cache.set(key, token, ttl, function (err) {
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
        Cache.get(key, function (err, cached) {
            if (cached) {

                const keyToDelete = {
                    segment: 'DeletedTokens',
                    id: cached.item
                };

                Cache.set(keyToDelete, cached.item, cached.ttl, function (err) {});
            }

            cacheToken();
        });
    }
};

/**
 * @api {get} /me Get current user informations
 * @apiName Me
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/me -H "Authorization: private_token"
 *
 * @apiPermission all users.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 200 Connected user informations.
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
exports.me = {
    description: 'Get current user',
    handler: function (request, reply) {

        const User = this.models.User;
        const Role = this.models.Role;
        const payload = request.decoded;

        User.findOne({
            where: {
                username: {
                    $eq: payload.username
                }
            },
            include: {
                model: Role
            },
            attributes: {
                exclude: ['password', 'deleted_at']
            }
        }).then(result => {
            if (result) {
                return reply(result);
            } else {
                return reply.badImplementation();
            }
        }).catch(err => reply.badImplementation(err));
    }
};

/**
 * @api {patch} /me Update current user informations
 * @apiName PatchMe
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiPermission all users.
 *
 * @apiParam (payload) password The new password.
 * @apiParam (payload) email The new email.
 * @apiParam (payload) firstName The new first name.
 * @apiParam (payload) lastName The new last name.
 * @apiParam (payload) phoneNumber The new phone number.
 * @apiParam (payload) notify The new value of notify (news).
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 204 No content.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 409 Conflict with the new username or email.
 *
 */
exports.patchMe = {
    description: 'Update current user',
    validate: {
        payload: {
            password: Joi.string().min(1).max(255).description('User password'),
            email: Joi.string().email().description('User email'),
            firstName: Joi.string().max(255).allow('').description('User first name'),
            lastName: Joi.string().max(255).allow('').description('User last name'),
            phoneNumber: Joi.string().max(255).allow('').description('User phone number'),
            notify: Joi.boolean()
        },
    },
    handler: function (request, reply) {

        const User = this.models.User;
        const Role = this.models.Role;
        const payload = request.decoded;

        User.update(
                request.payload, {
                    where: {
                        username: payload.username
                    }
                }
            )
            .then(result => reply().code(204))
            .catch(error => reply.conflict(error));
    }
};

/**
 * @api {get} /me/courses Get current user's subscribed courses
 * @apiName MeCourses
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiPermission all users.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 200 All the subscribed current user courses.
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
exports.getCourses = {
    description: 'Get the courses (subscribed)',
    handler: function (request, reply) {

        Utils.findUser(this.models.User, request.decoded.username)
            .then(function(user) {
            return user.getCourses();
        }).then(function(results) {
            const promises = _.map(results, c => Utils.getCourse(c));
            return Promise.all(promises);
        }).then(function(courses) {
            return reply(courses);
        }).catch(function(error) {
            return reply.badImplementation(error);
        });
    }
};

/**
 * @api {get} /me/news Get current user's subscribed courses news
 * @apiName MeCoursesNews
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiPermission all users.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 200 All the subscribed current user courses news.
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
exports.getNews = {
    description: 'Get news of subscribed courses',
    handler: function (request, reply) {

        const User = this.models.User;
        const News = this.models.News;

        const pagination = request.query.pagination;

        Utils.findUser(User, request.decoded.username).then(function (user) {
            return user.getCourses({
                attributes: ['code'],
                joinTableAttributes: []
            });
        }).then(function (courses) {
            return _.map(courses, c => c.get('code'));
        }).then(function (codes) {

            const options = {
                where: {
                    $or: [{
                        course: {
                            $in: codes
                        }
                    }, {
                        course: null
                    }]
                },
                order: 'date DESC'
            };

            if (pagination) {
                options.limit  = request.query.limit;
                options.offset = (request.query.page - 1) * request.query.limit;
            }

            return News.findAndCountAll(options);

        }).then(function (results) {
            if (pagination) {
                return reply.paginate(results.rows, results.count);
            } else {
                return reply(results.rows);
            }
        }).catch(function(error) {
            return reply.badImplementation(error);
        });
    }
};
