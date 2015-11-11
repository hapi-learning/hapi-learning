'use strict';

const Joi = require('joi');
Joi.phone = require('joi-phone');

const Utils = require('../utils/sequelize');

exports.get = {
    description: 'Get one user',
    validate: {
        params: {
            username: Joi.string().min(1).max(255).required().description('User personal ID')
        },
        query: {
            tags: Joi.array().items(Joi.string().required())
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;

        User.findOne({
                where: {
                    username: { $eq: request.params.username }
                },
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .then(result => {
                if (result) {
                    return reply(Utils.removeDates(result));
                } else {
                    return reply.notFound('User not found');
                }
            })
            .catch(err => reply.badImplementation(err));

        }
};


exports.getAll = {
    description: 'Get all users',
    handler: function(request, reply) {

        const User = this.models.User;

        User.findAll({
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .then(results => reply(Utils.removeDates(results)))
            .catch(err => reply.badImplementation(err));
    }
};

const schemaUserPOST = function(){
    const user = Joi.object().keys({
        username: Joi.string().min(1).max(30).required().description('User personal ID'),
        password: Joi.string().min(1).max(255).required().description('User password'),
        email: Joi.string().email().required().description('User email'),
        firstName: Joi.string().min(1).max(255).description('User first name'),
        lastName: Joi.string().min(1).max(255).description('User last name'),
        phoneNumber: Joi.phone.e164().description('User phone number'),
        role_id: Joi.number().integer().default(1)
    });

    return Joi.alternatives().try(user, Joi.array().items(user.required()));
};

exports.post = {
    description: 'Add user',
    validate: {
        payload : schemaUserPOST()
    },
    handler: function(request, reply) {

        const User = this.models.User;

        if (Array.isArray(request.payload))
        {
            /*
            User.bulkCreate(request.payload, {validate : true})
            */
            User.bulkCreate(
                Utils.extractUsers(request.payload),
                {validate : true}
            )
            .then(results => (reply({count : results.length}).code(201)))
            .catch(() => reply.conflict());
        }
        else
        {
            User.create(Utils.extractUsers(request.payload))
            .then(result => reply(Utils.removeDates(result)).code(201))
            .catch(() => reply.conflict());
        }
    }
};

exports.delete = {
    description: 'Delete user',
    validate: {
        params: {
            id: Joi.string().min(1).max(30).required().description('User personal ID')
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;

        User.destroy({
            where : {
                username : { $eq: request.params.username }
            }
        })
        .then(count => reply({count : count}))
        .catch(err => reply.badImplementation(err));
    }
};

exports.put = {
    description: 'Update all info about user (except username)',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
        },
        payload: {
            password: Joi.string().min(1).max(255).required().description('User password'),
            email: Joi.string().min(1).max(255).required().description('User email'),
            firstName: Joi.string().min(1).max(255).description('User first name'),
            lastName: Joi.string().min(1).max(255).description('User last name'),
            phoneNumber: Joi.string().min(1).max(255).description('User phone number')
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;

        User.update(
        {
            password: request.payload.password,
            email: request.payload.email,
            firstName: request.payload.firstName,
            lastName: request.payload.lastName,
            phoneNumber: request.payload.phoneNumber,
        },
        {
            where: {username: { $eq: request.params.username } }
        }
        )
        .then(result => reply({count : result[0] || 0}))
        .catch(err => reply.conflict(err));
    }
};


exports.patch = {
    description: 'Update some info about user (except username)',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
        },
        payload: {
            password: Joi.string().min(1).max(255).description('User password'),
            email: Joi.string().min(1).max(255).description('User email'),
            firstName: Joi.string().min(1).max(255).description('User first name'),
            lastName: Joi.string().min(1).max(255).description('User last name'),
            phoneNumber: Joi.string().min(1).max(255).description('User phone number')
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;

        // NEED TESTING
        User.update(
                request.payload,
                {
                    where: {
                        username: { $eq: request.params.username }
                    }
                }
            )
            .then(result => reply({count : result[0] || 0}))
            .catch(error => reply.conflict(error));
    }
};

exports.getTags = {
    description: 'Get the user\'s tag',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID')
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;

        User.findOne({
                where: {
                    username: { $eq: request.params.username }
                },
                attributes: {
                    exclude: 'password'
                }
            })
            .then(result => {
                if (result) {
                    results.getTags().then(tags => reply(tags));
                } else {
                    return reply.notFound('User not found');
                }
            })
            .catch(err => reply.badImplementation(err));
    }
};

exports.getCourses = {

    description: 'Get the courses (subscribed)',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID')
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;

        User.findOne({
                where: {
                    username: { $eq: request.params.username }
                },
                attributes: {
                    exclude: 'password'
                }
            })
            .then(result => {
                if (result) {
                    result.getCourses().then(courses => reply(courses));
                } else {
                    reply.notFound('User not found');
                }
            })
            .catch(err => reply.badImplementation(err));
    }
};

exports.subscribeToCourse = {
    description: 'Subscribe to a course',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            course: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

exports.unsubscribeToCourse = {
    description: 'Unsubscribe to a course',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            course: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

exports.addFolder = {
    description: 'Add a folder',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            folder: Joi.string().min(1).max(255).required().description('New folder name')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

exports.addCourseToFolder = {
    description: 'Add a course to the folder (removes from the old folder)',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            folder: Joi.string().min(1).max(255).required().description('New folder name'),
            course: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

