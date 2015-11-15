'use strict';

const Joi = require('joi');
const JWT = require('jsonwebtoken');
const Bcrypt = require('bcrypt-nodejs');
const Boom = require('boom');

exports.login = {
    description: 'Login and returns a token',
    auth: false,
    validate: {
        payload: Joi.object().keys({
            username: Joi.string(),
            email: Joi.string().email(),
            password: Joi.string().required()
        }).xor('username', 'email')
    },
    handler: function (request, reply) {
        const User = this.models.User;
        const Role = this.models.Role;

        let where = {};
        if (request.payload.username) {
            where.username = { $eq: request.payload.username };
        } else {
            where.email = { $eq: request.payload.email };
        }

        User.findOne({
            include: [{
                model: Role
            }],
            where: where
        })
        .then(result => {
            if (result && Bcrypt.compareSync(request.payload.password,
                                             result.password, {
                                                expiresIn: process.env.TOKEN_EXP || 7200
                                             }))
            {
                const payload = {
                    id: result.id,
                    username: result.username,
                    email: result.email,
                    role: result.Role.name,
                    isAdmin: (result.Role.name === 'admin')
                };

                const token = {
                    token: JWT.sign(payload, process.env.AUTH_KEY),
                };

                reply(token);
            }
            else
            {
                reply(Boom.unauthorized('Invalid username and/or password'));
            }
        });
    }
};

exports.logout = {
    description: 'Logout and revoke the token',
    handler: function (request, reply) {
        reply('Not implemented');
    }
};

exports.me = {
    description: 'Get current user',
    handler: function (request, reply) {
        const User = this.models.User;

        let authorization = request.headers.authorization;

        // Removes useless labels
        authorization = authorization.replace(/Bearer/gi, '').replace(/ /g, '')
        const payload = JWT.decode(authorization);

        if (!payload) {
            return reply.badImplementation('Invalid authorization header parsing');
        };

        User.findOne({
            where: {
                username: { $eq: payload.username }
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
