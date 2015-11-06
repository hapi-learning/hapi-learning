'use strict';

const Joi = require('joi');
Joi.phone = require('joi-phone');
const Boom = require('boom');

const utilities = require('../utils/utilities.js');

exports.get = {
    auth: false,
    description: 'Get one user',
    validate: {
        params: {
            username: Joi.string().min(1).max(255).required().description('User personal ID')
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;

        User.findOne({
                where: {
                    username: request.params.username
                },
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .catch(error => reply(Boom.badImplementation(error)))
            .then(result => {
                if (result)
                    return reply(result);
                else
                    return reply(Boom.notFound('User not found'));
            });
        }
};


exports.getAll = {
    auth: false,
    description: 'Get all users',
    handler: function(request, reply) {
        
        const User = this.models.User;
        
        User.findAll({
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .catch(error => reply(Boom.notFound(error)))
            .then(results => reply(utilities.clean_results(results)));
    }
};

exports.post = {
    auth: false,
    description: 'Add user',
    validate: {
        payload: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            password: Joi.string().min(1).max(255).required().description('User password'),
            email: Joi.string().email().required().description('User email'),
            firstName: Joi.string().min(1).max(255).description('User first name'),
            lastName: Joi.string().min(1).max(255).description('User last name'),
            phoneNumber: Joi.phone.e164().description('User phone number')
        }
    },
    handler: function(request, reply) {
        
        const User = this.models.User;
        
        User.create({
            username : request.payload.username,
            password: request.payload.password,
            email: request.payload.email,
            firstName: request.payload.firstName,
            lastName: request.payload.lastName,
            phoneNumber: request.payload.phoneNumber
        })
        .then(result => reply(utilities.clean_result(result)).code(201))
        .catch(error => reply(Boom.conflict(error)));
    }
};

exports.delete = {
    auth: false,
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
                username : request.params.username
            }
        })
        .then(count => reply({count : count}))
        .catch(error => reply(error));
    }
};

exports.put = {
    auth: false,
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
            where: {username: request.params.username}
        }
        )
        .then(result => reply({count : result[0] || 0}))
        .catch(error => reply(error));
    }
};


exports.patch = {
    auth: false,
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

        var payload = {};

        if (request.payload.password)
            payload.password = request.payload.password;

        if (request.payload.email)
            payload.email = request.payload.email;

        if (request.payload.firstName)
            payload.firstName = request.payload.firstName;

        if (request.payload.lastName)
            payload.lastName = request.payload.lastName;

        if (request.payload.phoneNumber)
            payload.phoneNumber = request.payload.phoneNumber;

        User.update(
                payload,
                {
                    where: {
                        username: request.params.username
                    }
                }
            )
            .then(result => reply({count : result[0] || 0}))
            .catch(error => reply(error));
    }
};

exports.getTags = {
    auth: false,
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
                    username: request.params.username
                },
                attributes: {
                    exclude: 'password'
                }
            })
            .catch(error => reply(Boom.badRequest(error)))
            .then(result => result.getTags()
                  .then(tags => reply(tags)));
    }
};

exports.getCourses = {
    auth: false,
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
                    username: request.params.username
                },
                attributes: {
                    exclude: 'password'
                }
            })
            .catch(error => reply(Boom.badRequest(error)))
            .then(result => result.getCourses()
                  .then(courses => reply(courses)));
    }
};

exports.subscribeToCourse = {
    auth: false,
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
    auth: false,
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
    auth: false,
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
    auth: false,
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

