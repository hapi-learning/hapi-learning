'use strict';

const Joi = require('joi');
Joi.phone = require('joi-phone');

const Utils = require('../utils/sequelize');

const internals = {};

internals.findUser = function(User, username)
{
    return User.findOne({
        where: {
            username: username
            },
            attributes: {
                exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
            }
    });
};

const schemaUserTagsPOST = function()
{
    const tag = Joi.object().keys({
        name : Joi.string().min(1).max(255).required().description('Tag name')
    }).options({stripUnknown : true});

    return Joi.alternatives().try(tag, Joi.array().items(tag.required()));
};

exports.addTags = {
    description: 'Link tags to a user',
    validate: {
        params: {
            username: Joi.string().min(1).max(255).required().description('User personal ID')
        },
        payload: schemaUserTagsPOST()
    },
    handler : function(request, reply) {
        const Tag      = this.models.Tag;
        const User     = this.models.User;

        // const tags = [].concat(request.payload); DO NOT WORK
        var tags = [];
        
        if (Array.isArray(request.payload))
        {
            tags = request.payload;
        }
        else
        {
            tags.push(request.payload);
        }
        console.log(tags);

        Tag.findAll({
            where: { 
                name: { 
                    $in: tags 
                } 
            },
            attributes : {
                exclude: ['updated_at', 'deleted_at', 'created_at']
            }
        })
        .then(tags => {
            console.log('SHOULD NOT BE EMPTY');
            console.log(tags);
            internals.findUser(User, request.params.username)
            .then(user => {
                if (user) 
                {
                    user.addTags(tags).then(() => {
                       reply(Utils.removeDates(tags));
                    });
                } 
                else 
                {
                    return reply.notFound('The user ' + request.params.username + ' does not exists.');
                }
            });
        })
        .catch(error => reply.badImplementation(error));
    }
};

exports.get = {
    description: 'Get one user',
    validate: {
        params: {
            username: Joi.string().min(1).max(255).required().description('User personal ID')
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;

        internals.findUser(User, request.params.username)
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
        phoneNumber: Joi.phone.e164().description('User phone number')
    }).options({stripUnknown : true});

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
            User.bulkCreate(
                request.payload,
                {validate : true}
            )
            .then(results => (reply({count : results.length}).code(201)))
            .catch(() => reply.conflict());
        }
        else
        {
            User.create(request.payload)
            .then(result => reply(Utils.removeDates(result)).code(201))
            .catch(() => reply.conflict());
        }
    }
};

exports.delete = {
    description: 'Delete user',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID')
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

const updateHandler = function(request, reply) {

    const User = this.models.User;

    User.update(
        request.payload,
        {
            where: {
                username: request.params.username
            }
        }
    )
    .then(result => reply({count : result[0] || 0}))
    .catch(error => reply.badImplementation(error));
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
            firstName: Joi.string().min(1).max(255).required().description('User first name'),
            lastName: Joi.string().min(1).max(255).required().description('User last name'),
            phoneNumber: Joi.string().min(1).max(255).required().description('User phone number')
        }
    },
    handler: updateHandler
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
    handler: updateHandler
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
                    username: request.params.username
                },
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .catch(err => reply.notFound('User not found.'))
            .then(result => {
                if (result)
                {
                    return result.getTags();
                }
                else
                {
                    return [];
                }
            })
            .then(tags => reply(tags));
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
                    username: request.params.username
                },
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .catch(err => reply.badRequest(err))
            .then(result => result.getCourses()
                  .then(courses => reply(courses)));
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

