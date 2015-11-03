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
        console.log(request.headers.authorization);

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
        reply('Not implemented');
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
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

exports.put = {
    auth: false,
    description: 'Update user',
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
        reply('Not implemented');
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

