'use strict';

const Joi = require('joi');
const Boom = require('boom');

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
                }
            })
            .catch(error => reply(Boom.badRequest(error)))
            .then(result => reply(result));
    }
};


exports.getAll = {
    auth: false,
    description: 'Get all users',
    handler: function(request, reply) {
        
        const User = this.models.User;
        
        User.findAll()
            .catch(error => reply(Boom.notFound(error)))
            .then(results => reply(results));
    }
};

exports.post = {
    auth: false,
    description: 'Add user',
    validate: {
        payload: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            password: Joi.string().min(1).max(255).required().description('User password'),
            email: Joi.string().min(1).max(255).required().description('User email'),
            firstName: Joi.string().min(1).max(255).description('User first name'),
            lastName: Joi.string().min(1).max(255).description('User last name'),
            phoneNumber: Joi.string().min(1).max(255).description('User phone number')
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
        .then(user => reply(user))
        .catch(error => reply(Boom.badRequest(error)));
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
        .then(user => reply(user))
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
        .then(user => reply(user))
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

        if (request.payload.password != null)
            payload.password = request.payload.password;

        if (request.payload.email != null)
            payload.email = request.payload.email;

        if (request.payload.firstName != null)
            payload.firstName = request.payload.firstName;

        if (request.payload.lastName != null)
            payload.lastName = request.payload.lastName;

        if (request.payload.phoneNumber != null)
            payload.phoneNumber = request.payload.phoneNumber;

        User.update(
                payload,
                {
                    where: {
                        username: request.params.username
                    }
                }
            )
            .then(user => reply(user))
            .catch(error => reply(error));
    }
};

exports.getTags = {
    auth: false,
    description: 'Get the user\'s tag',
    validate: {
        params: {
            id: Joi.string().min(1).max(30).required().description('User personal ID')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

exports.getCourses = {
    auth: false,
    description: 'Get the courses (subscribed)',
    validate: {
        params: {
            id: Joi.string().min(1).max(30).required().description('User personal ID')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

exports.subscribeToCourse = {
    auth: false,
    description: 'Subscribe to a course',
    validate: {
        params: {
            id: Joi.string().min(1).max(30).required().description('User personal ID'),
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
            id: Joi.string().min(1).max(30).required().description('User personal ID'),
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
            id: Joi.string().min(1).max(30).required().description('User personal ID'),
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
            id: Joi.string().min(1).max(30).required().description('User personal ID'),
            folder: Joi.string().min(1).max(255).required().description('New folder name'),
            course: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

