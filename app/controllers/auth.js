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

        const where = {};
        if (request.payload.username) {
            where.username = {
                $eq: request.payload.username
            };
        }
        else {
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
        .then((result) => {
            // If the user exists and the passwords match
            if (result && Bcrypt.compareSync(request.payload.password,
                    result.password)) {

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

            // TODO add to auth attempt

            return reply(Boom.unauthorized('Invalid username and/or password'));
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
    handler: function (request, reply) {

        const User = this.models.User;
        //const PRR  = this.models.PasswordResetRequest;
        const Mailers = this.mailers;

        User.findOne({
            attributes: {
                exclude: ['password']
            },
            where: {
                email: request.payload.email
            }
        }).then((user) => {

            if (!user) {
                throw {};
            }

            const uuid = Uuid.v1();

            // No need to wait for this
            user.createPasswordResetRequest({
                uuid: uuid
            });

            const uri = request.server.select('web').info.uri + '/#/reset/' + uuid;
            return Mailers.sendPasswordReset(user, uri);
        }).finally(() => reply().code(202));

    }
};

exports.checkReset = {
    description: 'Check reset UUID',
    auth: false,
    validate: {
        query: {
            uuid: Joi.string().required()
        }
    },
    handler: function (request, reply) {

        const PRR   = this.models.PasswordResetRequest;
        const uuid  = request.query.uuid;

        PRR.findOne({
            where: {
                disabled: false,
                uuid: uuid
            }
        }).then((prr) => {

            const exp = 1000 * 60 * 60 * 24; // 1 day
            const isExpired = Date.now() - Date.parse(prr.get('time')) > exp;

            if (prr && !isExpired) {
                return reply();
            }

            return reply.notFound();
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
    pre: [{
        assign: 'ttl',
        method: function (request, reply) {

            const user = request.auth.credentials.user;
            const ttl = Math.abs(((user.iat + 7200) * 1000) - Date.now());

            return reply(ttl);
        }
    }],
    handler: function (request, reply) {

        const username = request.auth.credentials.user.username;
        const token = request.auth.credentials.token;
        const ttl = request.pre.ttl;

        request.server.methods.invalidateToken(username, token, ttl, (err) => {

            if (err) {
                return reply.badImplementation(err);
            }

            return reply().code(204);
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
        const payload = request.auth.credentials.user;

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
        }).then((result) => {

            if (result) {
                return reply(result);
            }

            return reply.badImplementation();
        }).catch((err) => reply.badImplementation(err));
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
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;
        const payload = request.auth.credentials.user;

        User.update(
                request.payload, {
                    where: {
                        username: payload.username
                    }
                }
            )
            .then((result) => reply().code(204))
            .catch((error) => reply.conflict(error));
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

        Utils.findUser(this.models.User, request.auth.credentials.user.username)
        .then((user)    => user.getCourses())
        .then((results) => Promise.all(_.map(results, (c) => Utils.getCourse(c))))
        .then(reply)
        .catch((err)    => reply.badImplementation(err));
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

        Utils.findUser(User, request.auth.credentials.user.username)
        .then((user) => {

            return user.getCourses({
                attributes: ['code'],
                joinTableAttributes: []
            });
        })
        .then((courses) => _.map(courses, (c) => c.get('code')))
        .then((codes) => {

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

        }).then((results) => {

            if (pagination) {
                return reply.paginate(results.rows, results.count);
            }

            return reply(results.rows);
        }).catch((err) => reply.badImplementation(err));
    }
};
