'use strict';

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
    .then(result => result[0] === 0 ? reply.notFound() : reply().code(204))
    .catch(error => reply.conflict(error));
};

internals.schemaUserPOST = function(){
    const user = Joi.object().keys({
            username: Joi.string().min(3).max(30).required().description('User personal ID'),
            password: Joi.string().min(3).max(255).required().description('User password'),
            email: Joi.string().email().required().description('User email'),
            firstName: Joi.string().min(1).max(255).description('User first name'),
            lastName: Joi.string().min(1).max(255).description('User last name'),
            phoneNumber: Joi.string().description('User phone number'),
            'role_id': Joi.number().integer().default(3)
        }).options({stripUnknown : true});

    return Joi.alternatives().try(user, Joi.array().items(user.required()));
};

/**
 * @api {get} /users/:username Get one user
 * @apiName GetUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/users/XYZ
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} username The user's username.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The user.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 User not found.
 *
 */
exports.get = {
    description: 'Get one user',
    validate: {
        params: {
            username: Joi.string().min(1).max(255).required().description('User personal ID')
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

/**
 * @api {get} /users Get all users
 * @apiName GetUsers
 * @apiGroup Users
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/users
 *
 * @apiPermission all users.
 *
 * @apiParam (search) {String} A search field (username, last name, first name, email).
 * @apiParam (query) {Number} [limit=25] Number of results per page.
 * @apiParam (query) {Number} [page=1] Page number.
 * @apiParam (query) {Boolean} [pagination=true] Enable / disable pagination.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The users with a meta object if pagination is true.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
exports.getAll = {
    description: 'Get all users',
    validate: {
        options: {
            allowUnknown: true
        },
        query: {
            search: Joi.string().min(2)
        }
    },
    handler: function(request, reply) {

        const User = this.models.User;
        const pagination = request.query.pagination;
        const search = request.query.search;

        const options = {
            attributes: {
                exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
            }
        };

        if (search) {
            const like = {
                $like: '%' + search + '%'
            };

            options.where = {
                $or: [{
                    email: like
                }, {
                    username: like
                }, {
                    firstName: like
                }, {
                    lastName: like
                }]
            };
        }

        if (pagination) {
            options.limit = request.query.limit;
            options.offset = (request.query.page - 1) * request.query.limit;
        }

        User.findAndCountAll(options)
            .then(results => {
                if (pagination) {
                    return reply.paginate(Utils.removeDates(results.rows), results.count);
                } else {
                    return reply(results.rows);
                }
            })
            .catch(err => reply.badImplementation(err));
    }
};

/**
 * @api {get} /teachers Get all teachers
 * @apiName GetTeachers
 * @apiGroup Users
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/teachers
 *
 * @apiPermission all users.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An array of teachers.
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
exports.getTeachers = {
    description: 'Get only teachers',
    handler: function(request, reply) {

        const User = this.models.User;

        User.findAll({
                where: { 'role_id': 2 },
                attributes: {
                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                }
            })
            .then(results => reply(Utils.removeDates(results)))
            .catch(err => reply.badImplementation(err));
    }
};

/**
 * @api {post} /users Post user
 * @apiName PostUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission admin.
 *
 * @apiDescription It is possible to provide an array of user instead of just one
 * object, in that case, the return value will be the count of user created.
 *
 * @apiParam (payload) {String} username The user's username.
 * @apiParam (payload) {String} password The user's password.
 * @apiParam (payload) {String} email The user's email.
 * @apiParam (payload) {String} [firstName] The user's first name.
 * @apiParam (payload) {String} [lastName] The user's last name.
 * @apiParam (payload) {String} [phoneNumber] The user's phone number.
 * @apiParam (payload) {Number=1,2,3} [role_id=3] The user's role id (1 = admin, 2 = teacher, 3 = user).
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 201 The created user (if one), the count of users created (if many).
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 409 User's username or email already exists.
 *
 */
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

/**
 * @api {post} /users/:username/tags Add user's tags
 * @apiName AddTagsUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and concerned user.
 *
 * @apiDescription Non existing tags will be ignored.
 *
 * @apiParam (path) {String} username The user's username.
 *
 * @apiParam (payload) {String[]} tags An array of tags name.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The updated user.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 User not found.
 *
 */
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

/**
 * @api {delete} /users/:username Delete user
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission admin.
 *
 * @apiParam (path) {String} username The user's username.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 204 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 User not found.
 *
 */
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
        .then(count => count === 0 ? reply.notFound() : reply().code(204))
        .catch(err => reply.badImplementation(err));
    }
};


/**
 * @api {put} /users/:username Update user (PUT)
 * @apiName PutUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and concerned user.
 *
 * @apiParam (path) {String} username The user's username.

 * @apiParam (payload) {String} password The user's password.
 * @apiParam (payload) {String} email The user's email.
 * @apiParam (payload) {String} firstName The user's first name.
 * @apiParam (payload) {String} lastName The user's last name.
 * @apiParam (payload) {String} phoneNumber The user's phone number.
 * @apiParam (payload) {Boolean} notify True if the user wants to be notified (news).
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 204 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 User not found.
 * @apiError {json} 409 User's username or email already exists.
 *
 */
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
            phoneNumber: Joi.string().min(1).max(255).required().description('User phone number'),
            notify: Joi.boolean()
        }
    },

    handler: internals.updateHandler
};

/**
 * @api {patch} /users/:username Update user (PATCH)
 * @apiName PatchUser
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and concerned user.
 *
 * @apiParam (path) {String} username The user's username.

 * @apiParam (payload) {String} [password] The user's password.
 * @apiParam (payload) {String} [email] The user's email.
 * @apiParam (payload) {String} [firstName] The user's first name.
 * @apiParam (payload) {String} [lastName] The user's last name.
 * @apiParam (payload) {String} [phoneNumber] The user's phone number.
 * @apiParam (payload) {Boolean} [notify] True if the user wants to be notified (news).
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 204 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 User not found.
 * @apiError {json} 409 User's username or email already exists.
 *
 */
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
            phoneNumber: Joi.string().max(255).allow('').description('User phone number'),
            notify: Joi.boolean()
        }
    },
    handler: internals.updateHandler
};

/**
 * @api {get} /users/:username/tags Get user tags
 * @apiName GetUserTags
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} username The user's username.

 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An array of tag.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 User not found.
 *
 */
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

/**
 * @api {get} /users/:username/courses Get user subscribed courses.
 * @apiName GetUserCourses
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} username The user's username.

 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An array of courses.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 User not found.
 *
 */
exports.getCourses = {
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

/**
 * @api {post} /users/:username/subscribe/:crsId Subscribe to course
 * @apiName UserSubscribe
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and concerned user.
 *
 * @apiParam (path) {String} username The user's username.
 * @apiParam (path) {String} crsId The course code.

 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The subscribed course.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 User not found or course not found.
 * @apiError {json} 409 Already subscribed.
 *
 */
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

        let userToUpdate;
        Utils.findUser(User, request.params.username).then(user => {
            if (user) {
                userToUpdate = user;
                return user.getCourses({where : {code : request.params.crsId}, joinTableAttributes: []});
            } else {
                throw { statusCode: 404, message: 'User not found' };
            }
        }).then(courses => {
            if (courses.length > 0) {
                throw { statusCode: 409, message: 'Already subscribed' };
            } else {
                return Course.findOne({ where: { code: request.params.crsId }});
            }
        }).then(course => {
            if (course) {
                return userToUpdate.addCourse(course).then(() => Utils.getCourse(course));
            } else {
                throw { statusCode: 404, message: 'Course not found' };
            }
        }).then(course => {
            return reply(course);
        }).catch(err => {
            switch(err.statusCode) {
                case 404:
                    return reply.notFound(err.message);
                case 409:
                    return reply.conflict(err.message);
                default:
                    return reply.badImplementation(err);
            }
        });
    }
};

/**
 * @api {post} /users/:username/subscribe/:crsId Unsubscribe to course
 * @apiName UserUnsubscribe
 * @apiGroup Users
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and concerned user.
 *
 * @apiParam (path) {String} username The user's username.
 * @apiParam (path) {String} crsId The course code.

 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The unsubscribed course.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 User not found or course not found (or already unsubscribed).
 *
 */
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

        const User   = this.models.User;

        let userToUpdate;
        Utils.findUser(User, request.params.username).then(user => {
            if (user) {
                userToUpdate = user;
                return user.getCourses({where : {code : request.params.crsId}, joinTableAttributes: []});
            } else {
                throw { statusCode: 404, message: 'User not found' };
            }
        }).spread(course => {
            if (course) {
                return userToUpdate.removeCourse(course).then(() => Utils.getCourse(course));
            } else {
                throw { statusCode: 404, message: 'Course not found' };
            }
        }).then(course => {
            return reply(course);
        }).catch(err => {
            switch(err.statusCode) {
                case 404:
                    return reply.notFound(err.message);
                default:
                    return reply.badImplementation(err);
            }
        });
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
                    });


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

/*exports.addCourseToFolder = {
    auth: {
        scope: ['admin', '{params.username}']
    },
    description: 'Add a course to the folder (removes from the old folder)',
    validate: {
        params: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            folderName: Joi.string().min(1).max(255).required().description('New folder name'),
            crsId: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function(request, reply) {

        const User   = this.models.User;
        const Folder = this.models.Folder;
        const Course = this.models.course;

        internals.findUser(User, request.params.username).then(user => {
            if (user)
            {
                user.getFolders().then(userFolders => {
                    const folder = _.find(userFolders, (userFolder) => userFolder.name === request.params.folderName);
                    if (folder)
                        user.getCourses({where : {code : request.params.crsId}}).then(userCourse => {

                            if (userCourse)
                            {
                                folder.addCourse(userCourse);

                                let oldFolder = _.find(userFolders, function (userFolder) {
                                    (_.find(folder.getCourses, function(course) =>
                                            course.crsId === request.params.crsId)
                                            !== undefined)
                                }); // WHAT
                                if (oldFolder)
                                    oldFolder.removeCourse(userCourse);
                            }
                            else
                                return reply.notFound('User did not suscribe to course ' +
                                                      request.params.crsId);
                        })
                        .catch(error => reply.badImplementation(error));
                    else
                        return reply.notFound('User doesn\'t own the folder ' + request.params.folderName);
                })
                .catch(error => reply.badImplementation(error));
            }
            else
                return reply.notFound('User ' + request.params.username + ' not found');
        })
        .catch(error => reply.badImplementation(error));
    }
};*/

