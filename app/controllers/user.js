'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
Joi.phone = require('joi-phone');
const P = require('bluebird');

const Utils = require('../utils/sequelize');
const _ = require('lodash');

const internals = {};

internals.updateHandler = function(request, reply) {

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
    .catch(error => reply.conflict(error));
};

internals.schemaUserPOST = function(){
    const user = Joi.object().keys({
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            password: Joi.string().min(1).max(255).required().description('User password'),
            email: Joi.string().email().required().description('User email'),
            firstName: Joi.string().min(1).max(255).description('User first name'),
            lastName: Joi.string().min(1).max(255).description('User last name'),
            phoneNumber: Joi.string().description('User phone number'),
            role_id: Joi.number().integer().default(3)
        }).options({stripUnknown : true});

    return Joi.alternatives().try(user, Joi.array().items(user.required()));
};

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

        Utils.findUser(User, request.params.username)
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

        User.findAndCountAll({
                limit: request.query.limit,
                offset: (request.query.page - 1) * request.query.limit,
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .then(results => reply.paginate(Utils.removeDates(results.rows), results.count))
            .catch(err => reply.badImplementation(err));
    }
};


exports.getTeachers = {
    description: 'Get only teachers',
    handler: function(request, reply) {

        const User = this.models.User;

        User.findAndCountAll({
                where: {role_id: 2},
                limit: request.query.limit,
                offset: (request.query.page - 1) * request.query.limit,
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .then(results => reply.paginate(Utils.removeDates(results.rows), results.count))
            .catch(err => reply.badImplementation(err));
    }
};


exports.post = {
    auth: {
        scope: ['admin']
    },
    description: 'Add user',
    validate: {
        payload : internals.schemaUserPOST()
    },
    handler: function(request, reply) {

        const User = this.models.User;
        if (Array.isArray(request.payload)) {
            User.bulkCreate(
                request.payload,
                {validate : true}
            )
            .then(results => (reply({count : results.length}).code(201)))
            .catch((error) => {
                return reply.conflict(error);
            });
        } else {
            User.create(request.payload)
            .then(result => reply(Utils.removeDates(result)).code(201))
            .catch((error) => {
                return reply.conflict(error);
            });
        }
    }
};

exports.addTags = {
    auth: {
        scope: ['admin', '{params.username}']
    },
    description: 'Link tags to a user',
    validate: {
        params: {
            username: Joi.string().min(1).max(255).required().description('User personal ID')
        },
        payload: {
            tags: Joi.array().items(Joi.string().required())
        }
    },
    handler : function(request, reply) {
        const Tag  = this.models.Tag;
        const User = this.models.User;


        const id = request.params.username;

        Tag.findAll({where: { name: { $in: request.payload.tags } }})
        .then(tags => {
            Utils.findUser(User, id)
            .then(user => {
                if (user) {
                    user.addTags(tags).then(() => {
                       Utils.getUser(user).then(result => {
                           return reply(result);
                       });
                    });
                } else {
                    return reply.notFound('The user ' + id + ' does not exists.');
                }
            });
        })
        .catch(err => reply.badImplementation(err));
    }
};

exports.delete = {
    auth: {
        scope: ['admin']
    },
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
                username : { $eq: request.params.username }
            }
        })
        .then(count => reply({count : count}))
        .catch(err => reply.badImplementation(err));
    }
};



exports.put = {
    auth: {
        scope: ['admin', '{params.username}']
    },
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

    handler: internals.updateHandler
};

exports.patch = {
    auth: {
        scope: ['admin', '{params.username}']
    },
    description: 'Update some info about user (except username)',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
        },
        payload: {
            password: Joi.string().min(1).max(255).description('User password'),
            email: Joi.string().email().description('User email'),
            firstName: Joi.string().max(255).allow('').description('User first name'),
            lastName: Joi.string().max(255).allow('').description('User last name'),
            phoneNumber: Joi.string().max(255).allow('').description('User phone number')
        }
    },
    handler: internals.updateHandler
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

            Utils.findUser(User, request.params.username)
            .then(user => {
                if (user) {
                    user.getTags()
                    .then(tags => reply(tags))
                    .catch(error => reply.badImplementation(error));
                } else {
                    return reply.notFound('User ' + request.params.username + ' not found');
                }
            })
            .catch(err => reply.badImplementation(err));
    }
};

exports.getFolders = {

    description: 'Get the user\'s folders',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID')
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;

        Utils.findUser(User, request.params.username)
        .then(user => {
            if (user)
            {
                user.getFolders()
                .then(folders => reply(folders))
                .catch(error => reply.badImplementation(error));
            }
            else
            {
                return reply.notFound('User ' + request.params.username + ' not found');
            }
        })
        .catch(error => reply.badImplementation(error));
    }
};

exports.getCourses = {
    auth: {
        scope: ['admin', '{params.username}']
    },
    description: 'Get the courses (subscribed)',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID')
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;

        Utils.findUser(User, request.params.username)
        .then(user => {
            if (user)
            {
                user.getCourses()
                .then(results => {
                    const promises = _.map(results, c => Utils.getCourse(c));

                    Promise.all(promises).then(courses => {
                       return reply(courses);
                    });
                })
                .catch(error => reply.badImplementation(error));
            }
            else
            {
                return reply.notFound('User ' + request.params.username + ' not found');
            }
        })
        .catch(error => reply.badImplementation(error));
    }
};


exports.subscribeToCourse = {
    auth: {
        scope: ['admin', '{params.username}']
    },
    description: 'Subscribe to a course',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            crsId: Joi.string().required().description('Course id')
        }
    },
    handler: function(request, reply) {

        const Course = this.models.Course;
        const User   = this.models.User;

        Utils.findUser(User, request.params.username)
        .then(user => {
            if (user) {
                user.getCourses({where : {code : request.params.crsId}})
                .then(courses => {
                    if (courses.length > 0) {
                        reply.conflict('Course ' + request.params.crsId + ' already subscribed');
                    } else {
                        Course.findOne({where : {code : request.params.crsId}})
                        .then(course => {
                            if (course) {
                                user.addCourse(course);

                                Utils.getCourse(course).then(result => reply(result));
                            } else {
                                return reply.notFound('Course ' + request.params.crsId + ' not found');
                            }
                        })
                        .catch(error => reply.badImplementation(error));
                    }
                })
                .catch(error => reply.badImplementation(error));
            } else {
                return reply.notFound('User ' + request.params.username + ' not found');
            }
        })
        .catch(error => reply.badImplementation(error));
    }
};

exports.unsubscribeToCourse = {
    auth: {
        scope: ['admin', '{params.username}']
    },
    description: 'Unsubscribe to a course',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            crsId: Joi.string().required().description('Course id')
        }
    },
    handler: function(request, reply) {

        const Course = this.models.Course;
        const User   = this.models.User;

        Utils.findUser(User, request.params.username)
        .then(user => {
            if (user) {
                user.getCourses({where : {code : request.params.crsId}, joinTableAttributes: []})
                .then(courses => {
                    if (courses.length > 0) {
                        user.removeCourse(courses)
                        .then(count => {
                            if (count > 0)
                            {
                                return reply(Utils.removeDates(courses)[0]);
                            }
                            else
                            {
                                return reply.notFound('Course ' + request.params.crsId + ' can not be subscribed');
                            }
                        })
                        .catch(error => reply.badImplementation(error));
                    } else {
                        return reply.notFound('Course ' + request.params.crsId + ' is not subscribed by the user');
                    }
                })
                .catch(error => reply.badImplementation(error));
            } else {
                return reply.notFound('User ' + request.params.username + ' not found');
            }


        })
        .catch(error => reply.badImplementation(error));
    }
};

exports.addFolders = {
    auth: {
        scope: ['admin', '{params.username}']
    },
    description: 'Add a folder',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
        },
        payload: {
            folders: Joi.array().items(Joi.string().required())
        }
    },
    handler: function(request, reply) {

        const User   = this.models.User;
        const Folder = this.models.Folder;

        const username = request.params.username;
        const folders  = request.payload.folders;

        Utils.findUser(User, username)
        .then(user => {
            if (user)
            {

                let promises = _.map(folders, folder => {
                    return Folder.findOne({
                        where : {
                            name : folder,
                            userId : user.id
                        }
                    });
                });

                Promise.all(promises)
                .then(values => {

                    new P(function(resolve, reject) {
                        const createFolders = [];
                        _.forEach(values, (value, key) => {
                            if (!value) {
                                createFolders.push(user.createFolder({name : folders[key]}));
                            }
                        });

                        P.all(createFolders).then(resolve).catch(reject);

                    }).then(() => {
                        user.getFolders()
                        .then(folders => reply(Utils.removeDates(folders)))
                        .catch(error => reply.badImplementation(error));
                    })


                })
                .catch(error => reply.badImplementation(error));
            }
            else
            {
                return reply.notFound('User ' + username + ' not found');
            }
        })
        .catch(error => reply.badImplementation(error));
    }
};

exports.addCourseToFolder = {
    auth: {
        scope: ['admin', '{params.username}']
    },
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

