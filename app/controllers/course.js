'use strict';

const Joi   = require('joi');
const _     = require('lodash');
const Hoek  = require('hoek');
const Utils = require('../utils/sequelize');
const Path  = require('path');
const Fs    = require('fs');
const StreamBuffers = require('stream-buffers');

const internals = {};

internals.checkCourse = function(Course, id, reply, callback) {

    Hoek.assert(Course, 'Model Course required');
    Hoek.assert(id, 'Course code required');
    Hoek.assert(callback, 'Callback required');
    Hoek.assert(reply, 'Reply interface required');

    Utils
        .findCourseByCode(Course, id)
        .then(result => {
            if (result) {
                return callback();
            } else {
                return reply.notFound('The course ' + id + ' does not exists.');
            }
        })
        .catch(err => reply.badImplementation(err));
};

internals.checkForbiddenPath = function(path) {
    return path.includes('/..') || path.includes('../');
};


exports.getAll = {
    description: 'List all the courses',
    validate: {
        options: {
            allowUnknown: true
        },
        query: {
            select: [Joi.string().valid('code', 'name', 'description'),
                    Joi.array(Joi.string().valid('code', 'name', 'description'))]
        }
    },
    handler: function (request, reply) {

        const Course = this.models.Course;
        const select = request.query.select;
        const pagination = request.query.pagination;

        const options = {};

        if (pagination) {
            options.limit  = request.query.limit;
            options.offset = (request.query.page - 1) * request.query.limit;
        }


        if (select) {
            options.attributes = [].concat(select);
        };

        Course
            .findAndCountAll(options).then(results => {

            if (select) {
                if (pagination) {
                    return reply.paginate(results.rows, results.count);
                } else {
                    return reply(results.rows);
                }
            } else {
                const promises = _.map(results.rows, (r => Utils.getCourse(r)));
                // Wait for all promises to end
                Promise
                    .all(promises)
                    .then(values => {
                        if (pagination) {
                            return reply.paginate(values, results.count)
                        } else {
                            return reply(values);
                        }
                    });
            }


        })
        .catch(err => reply.badImplementation(err));
    }
};


exports.get = {
    description: 'Get info for one course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;
        const id = request.params.id;

        Utils.findCourseByCode(Course, id)
        .then(result => {
            if (result) // If found
            {

                Utils.getCourse(result).then(course => reply(course));
            }
            else // If not found
            {
                return reply.notFound('Cannot find course ' + id);
            }
        })
        .catch(err => reply.badImplementation(err));

    }
};


// WORKS - How to unit test this ?
exports.getDocuments = {
    description: 'Get a ZIP containing documents or a file',
    auth: 'jwt-ignore-exp',
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            id: Joi.string().required().description('Course code'),
            path: Joi.string().default('/')
        },
        query: {
            hidden: Joi.boolean().default(false)
        }
    },
    handler: function (request, reply) {

        const Storage = this.storage;
        const path    = request.params.path;
        const course  = request.params.id;
        const hidden  = request.query.hidden;

        Storage
        .download(course, path, hidden)
        .then(function(results) {

            const isFile = results.isFile;
            const result = results.result;


            if (isFile)
            {

                const filename = Path.basename(result).replace(/"/g, '\\"');
                const contentDisposition = 'attachment; filename="' + filename + '"';
                var stream = Fs.createReadStream(result);

                return reply(stream)
                    .header('Content-Disposition', contentDisposition)
                    .header('Content-Length', results.size);
            }
            else
            {
                var stream = new StreamBuffers.ReadableStreamBuffer({
                    frequency: 10,     // in milliseconds.
                    chunkSize: 204800  // 200Ko
                });


                const pathName = path === '/' ? '' : '_' + require('path').basename(path);
                const filename = (course + pathName + '.zip').replace(/"/g, '\\"');
                const contentDisposition = 'attachment; filename="' + filename + '"';
                stream.put(result);
                stream.stop();

                return reply(stream)
                    .type('application/zip')
                    .header('Content-Disposition', contentDisposition);

            }
        })
        .catch(err => {
            switch(err.statusCode) {
                case 404:
                    return reply.notFound(err.message);
                case 500:
                default:
                    return reply.badImplementation(err.message);
            }
        });
    }
};



exports.getTree = {
    description: 'Get course folder tree',
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            id: Joi.string().required().description('Course code'),
            path: Joi.string().default('/')
        },
        query: {
            hidden: Joi.boolean().default(false)
        }
    },
    handler: function (request, reply) {

        const path = request.params.path;

        if (internals.checkForbiddenPath(path)) {
            return reply.forbidden();
        }

        const Storage   = this.storage;
        const Course    = this.models.Course;
        const id        = request.params.id;
        const hidden    = request.query.hidden;

        const tree = function() {
            Storage.getList(id, path, hidden).then(function(results) {
                return reply(results);
            }).catch(function(err) {
                switch (err.statusCode) {
                    case 404:
                        return reply.notFound(err.message);
                    case 500:
                    default:
                        return reply.badImplementation(err.message);
                }
            });
        };

        return internals.checkCourse(Course, id, reply, tree);
    }
};


exports.getStudents = {
    description: 'Get students following the course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;

        Utils.findCourseByCode(Course, request.params.id)
        .then(course => {
            course
                .getUsers({joinTableAttributes: []})
                .then(users => reply(Utils.removeDates(users)));
        })
        .catch(err => reply.badImplementation(err));
    }
};


exports.post = {
    auth: {
        scope: ['admin', 'teacher']
    },
    description: 'Add a course',
    validate: {
        options: {
            stripUnknown: true
        },
        payload: {
            name: Joi.string().min(1).max(255).required().description('Course name'),
            code: Joi.string().min(1).max(255).required().description('Course code'),
            description: Joi.string().description('Course description'),
            teachers: Joi.array().items(Joi.string()).description('Teachers'),
            tags: Joi.array().items(Joi.string()).description('Tags')
        }
    },
    handler: function (request, reply) {

        const Course  = this.models.Course;
        const User    = this.models.User;
        const Tag     = this.models.Tag;
        const Storage = this.storage;

        const name        = request.payload.name;
        const code        = request.payload.code;
        const description = request.payload.description;
        const pteachers   = request.payload.teachers;
        const ptags       = request.payload.tags;

        const hasTeachers = pteachers ? true : false;
        const hasTags     = ptags ? true : false;

        const coursePayload = {
            name: name,
            code: code,
            description: description
        };

        // If tags has been passed to the payload, return a promise
        // loading the tags, otherwise return a promise returning an empty array
        const getTags = hasTags ?
            Promise.resolve(Tag.findAll(
                {where: {name: {$in: ptags}}}))
            : Promise.resolve([]);

        // If teachers has been passed to the payload, return a promise
        // loading the teachers, otherwise return a promise returning an empty array
        const userExclude = ['password'];
        const getTeachers = hasTeachers ?
            Promise.resolve(User.findAll({
                where: {username: {$in: pteachers}},
                attributes: {exclude: userExclude}}))
            : Promise.resolve([]);

        // Loads tags and teachers to be added
        Promise
        .all([getTags, getTeachers])
        .then(values => {

                const tags     = values[0];
                const teachers = values[1];

                const wrongTeachers = (hasTeachers && teachers.length !== pteachers.length);
                const wrongTags     = (hasTags && tags.length !== ptags.length);

                if (wrongTeachers || wrongTags)
                {
                    return reply.badData(wrongTeachers ? 'Invalid teachers(s)' : 'Invalid tag(s)');
                }
                else
                {
                    // TODO - Should refactor this somewhere else.
                    // Create course
                    Course
                    .create(coursePayload)
                    .then(newCourse => {

                        // Add teachers and tags to the new added course
                        Promise
                        .all([newCourse.addTeachers(teachers), newCourse.addTags(tags)])
                        .then(() => {

                            // Build response
                            const course = newCourse.get({plain:true});
                            course.tags = _.map(tags, (t => t.get('name', {plain:true})));
                            course.teachers = _.map(teachers, (t => t.get('username', {plain:true})));

                            Storage.createCourse(course.code);

                            return reply(course).code(201);
                        });
                    })
                    .catch(() => reply.conflict());
                }
            });
    }
};

exports.postDocument = {
    description: 'Upload a file to a course',
    auth: 'jwt-ignore-exp',
    payload: {
        maxBytes: process.env.UPLOAD_MAX,
        output: 'stream',
        allow: 'multipart/form-data',
        parse: true,
        timeout: 60000
    },
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            id: Joi.string().required().description('Course code'),
            path: Joi.string().default('/')
        },
        query: {
            hidden: Joi.boolean().default(false)
        }
    },
    handler: function (request, reply) {

        const file = request.payload.file;

        if (!file) {
            return reply.badRequest('File required to post a document');
        }

        const filename = file.hapi.filename;

        if (!filename) {
            return reply.badRequest('Filename required to post a document');
        }

        const path = Path.join(request.params.path, filename);

        // needs a better verification, but will do it for now.
        if (internals.checkForbiddenPath(path)) {
            return reply.forbidden();
        }

        const course = request.params.id;
        const hidden = request.query.hidden;
        const Storage = this.storage;
        const Course = this.models.Course;

        const upload = function() {
            Storage.createOrReplaceFile(course, path, file, hidden).then(function() {
                return reply('File : ' + filename + ' successfuly uploaded').code(201);
            }).catch(function(err) {
                return reply.conflict(err);
            });
        };

        return internals.checkCourse(Course, course, reply, upload);
    }
};

exports.createFolder = {
    description: 'Create a folder to a course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code'),
            path: Joi.string().required().invalid('/')
        },
        query: {
            hidden: Joi.boolean().default(false)
        }
    },
    handler: function (request, reply) {

        const Storage = this.storage;
        const Course  = this.models.Course;
        const course  = request.params.id;

        const path = request.params.path;

        // needs a better verification, but will do it for now.
        if (internals.checkForbiddenPath(path)) {
            return reply.forbidden();
        }

        const createFolder = function() {
            Storage
                .createFolder(course, path, request.query.hidden)
                .then(() => reply().code(201))
                .catch(err => {
                    switch(err.statusCode) {
                        case 409:
                            return reply.conflict(err.message);
                        case 422:
                            return reply.badData(err.message);
                        case 500:
                        default:
                            return reply.badImplementation(err.message);

                    }
                });
        };

        return internals.checkCourse(Course, course, reply, createFolder);
    }
};

exports.updateFile = {
    description: 'Create a file or folder of a course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code'),
            path: Joi.string().required().invalid('/')
        },
        payload: {
            name: Joi.string().optional(),
            hidden: Joi.boolean().optional()
        }
    },
    handler: function (request, reply) {

        const Storage = this.storage;
        const Course  = this.models.Course;
        const course  = request.params.id;

        const path = request.params.path;
        const name = request.payload.name;
        const hidden = request.payload.hidden;

        // needs a better verification, but will do it for now.
        if (internals.checkForbiddenPath(path)) {
            return reply.forbidden();
        }

        const update = function() {
            Storage
                .update(course, path, {name: name, hidden: hidden})
                .then(file => reply(file).code(200))
                .catch(err => {
                    switch(err.statusCode) {
                        case 404:
                            return reply.notFound(err.message);
                        case 409:
                            return reply.conflict(err.message);
                        case 422:
                            return reply.badData(err.message);
                        case 500:
                        default:
                            return reply.badImplementation(err.message);
                    }

            });
        };

        return internals.checkCourse(Course, course, reply, update);
    }
};


// Tags that does not exists will be ignored
exports.addTags = {
    description: 'Add a list of tags to the course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code'),
        },
        payload: {
            tags: Joi.array().items(Joi.string().required())
        }
    },
    handler: function (request, reply) {

        const Tag    = this.models.Tag;
        const Course = this.models.Course;
        const id     = request.params.id;

        Tag
        .findAll({where: { name: { $in: request.payload.tags } }})
        .then(tags => {
            Utils.findCourseByCode(Course, request.params.id)
            .then(course => {
                if (course) {
                    course.addTags(tags).then(() => {
                       Utils.getCourse(course).then(result => {
                           return reply(result);
                       });
                    });
                } else {
                    return reply.notFound('The course ' + id + ' does not exists.');
                }
            });
        })
        .catch(reply.badImplementation);
    }
};

// Teachers that does not exists will be ignored
exports.addTeachers = {
    description: 'Add a list of teachers to the course',
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            id: Joi.string().required().description('Course code'),
        },
        payload: {
            teachers: Joi.array().items(Joi.string().required())
        }
    },
    handler: function (request, reply) {
        const User   = this.models.User;
        const Course = this.models.Course;
        const id     = request.params.id;

        User
        .findAll({where: { username: { $in: request.payload.teachers } }})
        .then(teachers => {
            Utils.findCourseByCode(Course, request.params.id)
            .then(course => {
                if (course) {
                    course.addTeachers(teachers).then(() => {
                        Utils.getCourse(course).then(result => {
                            return reply(result);
                        });
                    });
                } else {
                    return reply.notFound('The course ' + id + ' does not exists.');
                }
            });
        })
        .catch(err => reply.badImplementation(err));
    }
};


exports.patch = {
    description: 'Modify a course',
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            id: Joi.string().required().description('Course code')
        },
        payload: {
            name: Joi.string().min(1).max(255).description('Course name'),
            code: Joi.string().min(1).max(255).description('Course code'),
            description: Joi.string().min(1).max(255).description('Course description')
        }
    },
    handler: function (request, reply) {
        const Course  = this.models.Course;
        const id      = request.params.id;
        const newId   = request.payload.code;
        const Storage = this.storage;

        const renameFolder = function(returnValue) {
            Storage.renameCourse(id, newId)
                .then(() => reply(returnValue))
                .catch(err => reply.badImplementation(err));
        };

        Course
        .update(request.payload, { where: { code: { $eq: request.params.id } } })
        .then(values => {
            const toReturn = { count: values[0] };
            if (newId && values[0] !== 0) {
                return renameFolder(toReturn);
            } else {
                return reply(toReturn);
            }

        })
        .catch(() => reply.conflict());
    }
};


exports.delete = {
    description: 'Delete a course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code')
        }
    },
    handler: function (request, reply) {

        const Course = this.models.Course;
        const Storage = this.storage;

        Course.destroy({
            where : {
                code : { $eq: request.params.id }
            }
        })
        .then(count => {
            const tail = request.tail('Delete course folder');
            Storage.deleteCourse(request.params.id).then(tail);
            return reply({count: count});
        })
        .catch(err => reply.badImplementation(err));
    }
};

exports.deleteTags = {
    description: 'Delete a list of tags from the course',
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            id: Joi.string().required().description('Course code'),
        },
        payload: {
            tags: Joi.array().items(Joi.string().required())
        }
    },
    handler: function (request, reply) {

        const Tag    = this.models.Tag;
        const Course = this.models.Course;
        const ptags  = request.payload.tags;
        const id     = request.params.id;

        Tag
        .findAll({where: { name: { $in: ptags} }})
        .then(tags => {
            Utils.findCourseByCode(Course, id)
            .then(course => {
                if (course) {
                    course.removeTags(tags).then(() => {
                        Utils.getCourse(course).then(result => {
                            return reply(result);
                       });
                    });
                } else {
                    return reply.notFound('The course ' + id + 'does not exists.');
                }
            });
        })
        .catch(err => reply.badImplementation(err));
    }
};

exports.deleteTeachers = {
    description: 'Delete a list of teachers from the course',
    validate: {
        options: {
            stripUnknown: true
        },
        params: {
            id: Joi.string().required().description('Course code'),
        },
        payload: {
            teachers: Joi.array().items(Joi.string().required())
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;
        const Course = this.models.Course;

        const pteachers = request.payload.teachers;
        const id = request.params.id;

        User
        .findAll({where: { username: { $in: pteachers } }})
        .then(teachers => {
            Utils.findCourseByCode(Course, id)
            .then(course => {
                if (course) {
                    course.removeTeachers(teachers).then(() => {
                        Utils.getCourse(course).then(result => {
                            return reply(result);
                        });
                    });
                } else {
                    return reply.notFound('The course ' + id + 'does not exists.');
                }
            });
        })
        .catch(err => reply.badImplementation(err));
    }
};


/**
 * When returning not found, files may already have been deleted.
 * Page reloading may be necessary !
 */
exports.deleteDocument = {
    description: 'Delete a document from a course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code')
        },
        payload: {
            files: [Joi.string().required(), Joi.array().items(Joi.string().required())]
        }

    },
    handler: function (request, reply) {
        const Course  = this.models.Course;
        const Storage = this.storage;
        const id      = request.params.id;

        const files = request.payload.files;

        if (Array.isArray(files)) {
            _.forEach(files, (file => {
                if (internals.checkForbiddenPath(file)) {
                    reply.forbidden();
                }
            }));
        } else {
             if (internals.checkForbiddenPath(files)) {
                return reply.forbidden();
            }
        }

        const del = function() {
            Storage.delete(id, files)
                .then(() => reply().code(202))
                .catch((err) => reply.badImplementation(err));
        };

        internals.checkCourse(Course, id, reply, del);
    }
};

