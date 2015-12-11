'use strict';

const Joi   = require('joi');
const _     = require('lodash');
const Hoek  = require('hoek');
const Utils = require('../utils/sequelize');
const Path  = require('path');
const Fs    = require('fs');
const StreamBuffers = require('stream-buffers');
const P = require('bluebird');

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


/**
 * @api {get} /courses Get all courses
 * @apiName GetCourses
 * @apiGroup Courses
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/courses
 *
 * @apiPermission all users.
 *
 * @apiParam (query) {String[]} [select] Names of fields to select.
 * @apiParam (query) {String} [codename] Get by code or name of the course (OR condition).
 * @apiParam (query) {String} [code] Get by code of the course.
 * @apiParam (query) {String} [name] Get by name of the course.
 * @apiParam (query) {String[]} [tags] Get by tags of the course.
 * @apiParam (query) {Number} [limit=25] Limit of results per page.
 * @apiParam (query) {Number} [page=1] Page number.
 * @apiParam (query) {Boolean} [pagination=true] Enable / disable the pagination.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An object with metadata and array of results
 * if pagination is true or an array of results if pagination is false.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
exports.getAll = {
    description: 'List all the courses',
    validate: {
        options: {
            allowUnknown: true
        },
        query: Joi.object().keys({
            select: [Joi.string().valid('code', 'name'),
                    Joi.array(Joi.string().valid('code', 'name'))],
            codename: Joi.string(),
            code: Joi.string(),
            name: Joi.string(),
            tags: [Joi.string(), Joi.array(Joi.string())]
        }).without('codename', ['code', 'name'])
    },
    handler: function (request, reply) {

        const Course = this.models.Course;
        const User = this.models.User;
        const Tag = this.models.Tag;
        const select = request.query.select;
        const pagination = request.query.pagination;

        if (pagination && request.query.tags) {
            return reply.badRequest('Pagination does not works with tags filter');
        }

        const options = {};

        if (pagination) {
            options.limit  = request.query.limit;
            options.offset = (request.query.page - 1) * request.query.limit;
        }

        if (select) {
            options.attributes = [].concat(select);
        };

        if (request.query.codename) {
            options.where = {};
            options.where.$or = [{
                name: {
                    $like: request.query.codename + '%'
                }
            }, {
                code: {
                    $like: request.query.codename + '%'
                }
            }];
        }

        if (request.query.code) {
            options.where = {};
            options.where.code = {
                $like: request.query.code + '%'
            }
        }

        if (request.query.name) {
            options.where = options.where || {};
            options.where.name = {
                $like: request.query.name + '%'
            }
        }


        Course.findAndCountAll(options).then(results => {

            if (select) {
                if (pagination) {
                    return reply.paginate(results.rows, results.count);
                } else {
                    return reply(results.rows);
                }
            } else {
                const promises = _.map(results.rows, (r => Utils.getCourse(r, request.query.tags)));
                // Wait for all promises to end
                Promise.all(promises).then(values => {

                        // Need an alternative to that...
                        if (request.query.tags) {
                            _.remove(values, v => v == null);
                        }

                        if (pagination) {
                            return reply.paginate(values, results.count);
                        } else {
                            return reply(values);
                        }
                    });
            }


        })
        .catch(err => reply.badImplementation(err));
    }
};

/**
 * @api {get} /courses/:id Get one course
 * @apiName GetCourse
 * @apiGroup Courses
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/courses/XYZ
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} id Id of the course (code).

 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The course object.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 Course not found.
 *
 */
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

        Utils.findCourseByCode(Course, id).then(result => {
            if (result) {
                return Utils.getCourse(result);
            } else {
                throw { statusCode: 404, message: 'Course not found'};
            }
        }).then(function(result) {
            return reply(result);
        }).catch(function(err) {
            if (err.statusCode === 404) {
                return reply.notFound(err.message);
            } else {
                return reply.badImplementation(err);
            }
        });

    }
};

/**
 * @api {get} /courses/:id/homepage Get a course homepage
 * @apiName GetCourseHomepage
 * @apiGroup Courses
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/courses/XYZ/homepage
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} id Id of the course (code).

 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {String} 200 The homepage content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 Course not found.
 *
 */
exports.getHomepage = {
    description: 'Get the course\' homepage',
    validate: {
        params: {
            id: Joi.string().required().description('Course code')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;
        const Storage = this.storage;
        const id = request.params.id;

        const getHomepage = function() {
            return reply.file(Storage.getHomepage(id));
        };

        return internals.checkCourse(Course, id, reply, getHomepage);
    }
};


/**
 * @api {get} /courses/:id/documents/:path Get a course documents
 * @apiName GetCourseDocuments
 * @apiGroup Courses
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/courses/XYZ/documents/folder1/folder2/doc
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} id Id of the course (code).
 * @apiParam (path) {String} [path=/] The documents path.
 *
 * @apiParam (query) {Boolean} [hidden=false] True to see hidden files.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {Stream} 200 The files to download.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 Course not found.
 *
 */
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

        Storage.download(course, path, hidden).then(function(results) {

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


/**
 * @api {get} /courses/:id/documents/:path Get the list of documents in a directory
 * @apiName GetCourseTree
 * @apiGroup Courses
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/courses/XYZ/tree/folder1/folder2/doc
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} id Id of the course (code).
 * @apiParam (path) {String} [path=/] The documents path.
 *
 * @apiParam (query) {Boolean} [hidden=false] True to see hidden files.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An object with the parent directory and the files.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 Course not found.
 *
 */
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

/**
 * @api {get} /courses/:id/students Get all the students subscribed to a course
 * @apiName GetCourseStudents
 * @apiGroup Courses
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/courses/XYZ/students
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String} id Id of the course (code).
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An array of users (students).
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 Course not found.
 *
 */
exports.getStudents = {
    description: 'Get students following the course',
    validate: {
        params: {
            id: Joi.string().required().description('Course code')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;

        Utils.findCourseByCode(Course, request.params.id).then(course => {
            if (course) {
                return course.getUsers({joinTableAttributes: []});
            } else {
                throw { statusCode: 404, message: 'Course not found' };
            }
        }).then(function(users) {
            return reply(Utils.removeDates(users));
        }).catch(function(err) {
            if (err.statusCode === 404) {
                return reply.notFound(err.message);
            } else {
                return reply.badImplementation(err);
            }
        });
    }
};

/**
 * @api {post} /courses Post a course
 * @apiName PostCourse
 * @apiGroup Courses
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl -X POST http://localhost/courses -H "Content-Type: application/json" \
 *           -H "Authorization: private_token" -d '{"name": "Course Name", "code": "Course code"}'
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (payload) {String} name The course name.
 * @apiParam (payload) {String} code The course code.
 * @apiParam (payload) {String} [homepage] The course homepage.
 * @apiParam (payload) {String[]} [teachers] Array of teachers username.
 * @apiParam (payload) {String[]} [tags] Array of tags name.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 201 The created course.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 409 Course already exists.
 * @apiError {json} 422 Tag or teacher does not exists.
 *
 */
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
            homepage: Joi.string().default('').description('Course homepage'),
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
        const homepage    = request.payload.homepage;
        const pteachers   = request.payload.teachers;
        const ptags       = request.payload.tags;

        const hasTeachers = pteachers ? true : false;
        const hasTags     = ptags ? true : false;

        const coursePayload = {
            name: name,
            code: code
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
        P.all([getTags, getTeachers]).spread(function(tags, teachers) {
            const wrongTeachers = (hasTeachers && teachers.length !== pteachers.length);
            const wrongTags     = (hasTags && tags.length !== ptags.length);

            if (wrongTeachers || wrongTags) {
                const message = wrongTeachers ? 'Invalid teachers(s)' : 'Invalid tag(s)';
                throw { statusCode: 422, message: message };
            } else {
                return P.all([Course.create(coursePayload), tags, teachers]);
            }
        }).spread(function(course, tags, teachers) {

            return P.all([course, tags, teachers, course.addTeachers(teachers), course.addTags(tags)]);

        }).spread(function(newCourse, tags, teachers) {

            const course = newCourse.get({ plain:true });
            course.tags = _.map(tags, (t => t.get('name', { plain:true })));
            course.teachers = _.map(teachers, (t => t.get('username', { plain:true })));
            Storage.createCourse(course.code, homepage);
            return reply(course).code(201);

        }).catch(function(err) {
            if (err.statusCode === 422) {
                return reply.badData(err.message);
            } else {
                return reply.conflict();
            }
        });
    }
};

/**
 * @api {post} /courses/:id/documents/:path Upload a document
 * @apiName PostDocument
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 * @apiParam (path) {String} [path=/] The path where to upload the document.
 *
 * @apiParam (query) {Boolean} [hidden=false] True if the file is hidden, false otherwise.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 201 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.postDocument = {
    description: 'Upload a file to a course',
    auth: {
        strategies: ['jwt-ignore-exp'],
        scope: ['teacher', 'admin']
    },
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
            return reply.badRequest('Invalid path');
        }

        const course = request.params.id;
        const hidden = request.query.hidden;
        const Storage = this.storage;
        const Course = this.models.Course;

        const upload = function() {
            Storage.createOrReplaceFile(course, path, file, hidden).then(function() {
                return reply().code(201);
            }).catch(function(err) {
                return reply.conflict(err);
            });
        };

        return internals.checkCourse(Course, course, reply, upload);
    }
};

/**
 * @api {post} /courses/:id/folders/:path Create a folder
 * @apiName CreateFolder
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 * @apiParam (path) {String} path The path where to create the folder.
 *
 * @apiParam (query) {Boolean} [hidden=false] True if the file is hidden, false otherwise.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 201 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 * @apiError {json} 409 Folder already exists.
 *
 */
exports.createFolder = {
    description: 'Create a folder to a course',
    auth: {
        scope: ['admin', 'teacher']
    },
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
            return reply.badRequest('Invalid path');
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

/**
 * @api {post} /courses/:id/homepage Post homepage
 * @apiName PostHomepage
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiParam (payload) {String} content The homepage content.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 201 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.postHomepage = {
    description: 'Post the course\' homepage',
    auth: {
        strategies: ['jwt-ignore-exp'],
        scope: ['teacher', 'admin']
    },
    validate: {
        params: {
            id: Joi.string().required().description('Course code')
        },
        payload: {
            content: Joi.string().default('').allow('')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;
        const Storage = this.storage;
        const id = request.params.id;

        const setHomepage = function() {
            Storage.setHomepage(id, request.payload.content).then(function() {
                return reply().code(201);
            }).catch(function() {
                return reply.badImplementation();
            });
        };

        return internals.checkCourse(Course, id, reply, setHomepage);
    }
};

/**
 * @api {patch} /courses/:id/documents Update existing file
 * @apiName UpdateFile
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 * @apiParam (path) {String} path The file path (cannot be /).
 *
 * @apiParam (payload) {String} [name] The new file name.
 * @apiParam (payload) {String} [hidden] True if the file is to be hidden.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The updated file.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 * @apiError {json} 409 Conflict error - name already exists.
 *
 */
exports.updateFile = {
    description: 'Create a file or folder of a course',
    auth: {
        scope: ['admin', 'teacher']
    },
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


/**
 * @api {post} /courses/:id/tags Add tags to course
 * @apiName AddTags
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiDescription Tags that does not exists will be ignored (no 422 returned).
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiParam (payload) {String[]} tags An array of tag names.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The updated course.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.addTags = {
    description: 'Add a list of tags to the course',
    auth: {
        scope: ['admin', 'teacher']
    },
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

        Tag.findAll({
            where: {
                name: {
                    $in: request.payload.tags
                }
            }
        }).then(function(tags) {
            return P.all([Utils.findCourseByCode(Course, id), tags]);
        }).spread(function(course, tags) {
            if (course) {
                return P.all([course, course.addTags(tags)]);
            } else {
                throw { statusCode: 404, message: 'Course not found' };
            }
        }).spread(function(course) {
            return Utils.getCourse(course);
        }).then(reply).catch(function(err) {
            if (err.statusCode === 404) {
                return reply.notFound(err.message);
            } else {
                return reply.badImplementation(err);
            }
        });
    }
};

/**
 * @api {post} /courses/:id/tags Add teachers to course
 * @apiName AddTeachers
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiDescription Teachers that does not exists will be ignored (no 422 returned).
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiParam (payload) {String[]} teachers An array of teachers names.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The updated course.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.addTeachers = {
    description: 'Add a list of teachers to the course',
    auth: {
        scope: ['admin', 'teacher']
    },
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

        User.findAll({
            where: {
                username: {
                    $in: request.payload.teachers
                }
            }
        }).then(function(teachers) {
            return P.all([Utils.findCourseByCode(Course, id), teachers]);
        }).spread(function(course, teachers) {
            if (course) {
               return P.all([course, course.addTeachers(teachers)]);
            } else {
                throw { statusCode: 404, message: 'Course not found' };
            }
        }).spread(function(course) {
            return Utils.getCourse(course);
        }).then(reply).catch(function(err) {
            if (err.statusCode === 404) {
                return reply.notFound(err.message);
            } else {
                return reply.badImplementation(err);
            }
        });
    }
};

/**
 * @api {patch} /courses/:id Update an existing course
 * @apiName PatchCourse
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiParam (payload) {String[]} tags An array of tag names.
 * @apiParam (payload) {String[]} tags An array of tag names.
 * @apiParam (payload) {String[]} tags An array of tag names.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 204 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 * @apiError {json} 409 Course name or code already exists.
 *
 */
exports.patch = {
    description: 'Modify a course',
    auth: {
        scope: ['admin', 'teacher']
    },
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

        const renameFolder = function() {
            Storage.renameCourse(id, newId)
                .then(function() {
                    return reply().code(204);
                })
                .catch(err => reply.badImplementation(err));
        };

        Course
        .update(request.payload, { where: { code: { $eq: request.params.id } } })
        .then(values => {
            if (newId && values[0] !== 0) {
                return renameFolder();
            } else {
                return reply.notFound();
            }

        })
        .catch(() => reply.conflict());
    }
};

/**
 * @api {delete} /courses/:id Delete a course
 * @apiName DeleteCourse
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin.
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 204 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.delete = {
    description: 'Delete a course',
    auth: {
        scope: ['admin']
    },
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
            if (count === 0) {
                return reply.notFound();
            } else {
                const tail = request.tail('Delete course folder');
                Storage.deleteCourse(request.params.id).then(tail);
                return reply().code(204);
            }
        })
        .catch(err => reply.badImplementation(err));
    }
};

/**
 * @api {delete} /courses/:id/tags Delete course tags
 * @apiName DeleteCourseTags
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiParam (payload) {String[]} tags The tags to be removed from the course.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 204 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.deleteTags = {
    description: 'Delete a list of tags from the course',
    auth: {
        scope: ['admin', 'teacher']
    },
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

        Tag.findAll({
            where: {
                name: {
                    $in: ptags
                }
            }
        }).then(tags => {
            return P.all([Utils.findCourseByCode(Course, id), tags]);
        }).spread((course, tags) => {
            if (course) {
                return course.removeTags(tags).then(() => Utils.getCourse(course));
            } else {
                throw { statusCode: 404, message: 'Course not found' };
            }
        }).then(function() {
            return reply().code(204);
        }).catch(err => {
            if (err.statusCode === 404) {
               return reply.notFound(err.message);
            } else {
                return reply.badImplementation(err);
            }
        });
    }
};

/**
 * @api {delete} /courses/:id/teachers Delete course teachers
 * @apiName DeleteCourseTeachers
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiParam (payload) {String[]} teachers An array of teachers usernames to be removed from the course.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 204 No content.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.deleteTeachers = {
    description: 'Delete a list of teachers from the course',
    auth: {
        scope: ['admin', 'teacher']
    },
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


        User.findAll({
            where: {
                username: {
                    $in: pteachers
                }
            }
        }).then(teachers => {
            return P.all([Utils.findCourseByCode(Course, id), teachers]);
        }).spread((course, teachers) => {
            if (course) {
                return course.removeTeachers(teachers).then(() => Utils.getCourse(course));
            } else {
                throw { statusCode: 404, message: 'Course not found' };
            }
        }).then(function() {
            return reply().code(204);
        }).catch(err => {
            if (err.statusCode === 404) {
               return reply.notFound(err.message);
            } else {
                return reply.badImplementation(err);
            }
        });
    }
};


/**
 * @api {delete} /courses/:id/documents Delete course documents
 * @apiName DeleteCourseDocuments
 * @apiGroup Courses
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} id The course id (code).
 *
 * @apiParam (payload) {String[]} files An array files to be deleted from the course.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 202 Accepted.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Course not found.
 *
 */
exports.deleteDocument = {
    description: 'Delete a document from a course',
    auth: {
        scope: ['admin', 'teacher']
    },
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

