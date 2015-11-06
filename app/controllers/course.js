'use strict';

const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');

let internals = {};
internals.getCourse = function(result) {

    // Attributes to include in teachers
    const teachersInclude = ['id', 'username', 'email',
                             'first_name', 'last_name'];

    return Promise.resolve(
        Promise
        .all([result.getTags({attributes: ['name'], joinTableAttributes: []}),
              result.getTeachers({attributes: teachersInclude, joinTableAttributes: []})])

        .then(values => {
            let course = result.get({plain:true});
            course.tags = _.map(values[0], (t => t.get({plain:true})));
            course.teachers = _.map(values[1], (t => t.get({plain:true})));

            return course;
        })
    );
};

internals.findCourseByCode = function(Course, id) {
    return Course.findOne({
        where: {
            code: { $eq : id }
        }
    });
};


exports.getAll = {
    description: 'List all the courses',
    auth: false,
    handler: function (request, reply) {

        const Course = this.models.Course;

        Course.findAll().then(results => {

            let promises = _.map(results, (r => internals.getCourse(r)));
            // Wait for all promises to end
            Promise
                .all(promises)
                .then(values => reply(values));

        });
    }
};


exports.get = {
    description: 'Get info for one course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;

        internals.findCourseByCode(Course, request.params.id)
        .then(result => {
            if (result) // If found
            {
                internals.getCourse(result).then(course => reply(course));
            }
            else // If not found
            {
                return reply(Boom.notFound('Cannot find course ' + request.params.id));
            }
        })
        .catch(err => reply(Boom.badImplementation('An internal server error occurred : ' + err)));

    }
};


exports.getDocuments = {
    description: 'Get a ZIP containing all course documents',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code'),
            path: Joi.string().default('/')
        }
    },
    handler: function (request, reply) {

        const Storage = this.storage;
        const path = request.params.path;

        Storage
            .download(request.params.id, request.params.path)
            .then((results) => {

                if (results.isFile) {
                    return reply.file(results.result, { mode: 'attachment'});
                } else {
                    const pathName = path === '/' ? '' : '_' + require('path').basename(path);
                    const filename = request.params.id + pathName;
                    return reply(results.result)
                        .type('application/zip')
                        .header('Content-Disposition', 'attachment; filename=' + filename)
                }
            })
            .catch(err => {
                return reply(Boom.notFound('File not found'));
            });
    }
};




exports.getTree = {
    description: 'Get course folder tree',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id'),
            path: Joi.string() // TODO - FIXME
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};

exports.getStudents = {
    description: 'Get students following the course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;

        internals.findCourseByCode(Course, request.params.id)
        .then(course => {
            course.getUsers({joinTableAttributes: []}).then(users =>{
                reply(_.map(users, (u => u.get({plain:true}))));
            });
        })
        .catch(err => reply(Boom.badImplementation('An internal server error occurred : ' + err)));
    }
};


exports.post = {
    description: 'Add a course',
    validate: {
        payload: {
            name: Joi.string().min(1).max(255).required().description('Course name'),
            code: Joi.string().min(1).max(255).required().description('Course code'),
            description: Joi.string().min(1).max(255).description('Course description'),
            teachers: Joi.array().items(Joi.string()).description('Teachers'),
            tags: Joi.array().items(Joi.string()).description('Tags')
        }
    },
    handler: function (request, reply) {

        const Course = this.models.Course;
        const User = this.models.User;
        const Tag = this.models.Tag;
        const Storage = this.storage;

        const hasTeachers = request.payload.teachers ? true : false;
        const hasTags = request.payload.tags ? true : false;
        const coursePayload = {
            name: request.payload.name,
            code: request.payload.code,
            description: request.payload.description
        };

        // If tags has been passed to the payload, return a promise
        // loading the tags, otherwise return a promise returning an empty array
        const getTags = hasTags ?
            Promise.resolve(Tag.findAll(
                {where: {name: {$in: request.payload.tags}}}))
            : Promise.resolve([]);

        // If teachers has been passed to the payload, return a promise
        // loading the teachers, otherwise return a promise returning an empty array
        const userExclude = ['password'];
        const getTeachers = hasTeachers ?
            Promise.resolve(User.findAll(
                {where: {username: {$in: request.payload.teachers}},
                 attributes: {exclude: userExclude}}))
            : Promise.resolve([]);

        // Loads tags and teachers to be added
        Promise
        .all([getTags, getTeachers])
        .then(values => {

                const tags = values[0];
                const teachers = values[1];

                const wrongTeachers = (hasTeachers && teachers.length !== request.payload.teachers.length);
                const wrongTags = (hasTags && tags.length !== request.payload.tags.length);

                if (wrongTeachers || wrongTags)
                {
                    return reply(Boom.badData(wrongTeachers ? 'Invalid teachers(s)' : 'Invalid tag(s)'));
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
                            let course = newCourse.get({plain:true});
                            course.tags = _.map(tags, (t => t.get('name', {plain:true})));
                            course.teachers = _.map(teachers, (t => t.get('username', {plain:true})));

                            Storage.createCourse(course.code);

                            return reply(course);
                        });
                    })
                    .catch(() => reply(Boom.conflict('Conflict')));
                }
            });
    }
};


exports.postDocument = {
    description: 'Upload a file to a course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id'),
            path: Joi.string() // TODO - FIXME
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};

// Tags that does not exists will be ignored
exports.addTags = {
    description: 'Add a list of tags to the course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code'),
        },
        payload: {
            tags: Joi.array().items(Joi.string().required())
        }
    },
    handler: function (request, reply) {
        const Tag = this.models.Tag;
        const Course = this.models.Course;

        Tag
        .findAll({where: { name: { $in: request.payload.tags } }})
        .then(tags => {
            internals.findCourseByCode(Course, request.params.id)
            .then(course => course.addTags(tags).then(reply(course.get({plain:true}))));
        })
        .catch(err => reply(Boom.badImplementation('An internal server error occurred : ' + err)));
    }
};

// Teachers that does not exists will be ignored
exports.addTeachers = {
    description: 'Add a list of teachers to the course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code'),
        },
        payload: {
            teachers: Joi.array().items(Joi.string())
        }
    },
    handler: function (request, reply) {
        const User = this.models.User;
        const Course = this.models.Course;

        User
        .findAll({where: { username: { $in: request.payload.teachers } }})
        .then(teachers => {
            internals.findCourseByCode(Course, request.params.id)
            .then(course => course.addTeachers(teachers).then(reply(course.get({plain:true}))));
        })
        .catch(err => reply(Boom.badImplementation('An internal server error occurred : ' + err)));
    }
};


exports.patch = {
    description: 'Modify a course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code')
        },
        payload: {
            name: Joi.string().min(1).max(255).description('Course name'),
            code: Joi.string().min(1).max(255).description('Course code'),
            description: Joi.string().min(1).max(255).description('Course description')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;
        const payload = {};

        if (request.payload.name)
            payload.name = request.payload.name;

        if (request.payload.code)
            payload.code = request.payload.code;

        if (request.payload.description)
            payload.description = request.payload.description;

        Course
        .update(payload, { where: { code: { $eq: request.params.id } } })
        .then(values => reply({ count: values[0] }))
        .catch(err => reply(err));
    }
};


exports.delete = {
    description: 'Delete a course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code')
        }
    },
    handler: function (request, reply) {
        const Course = this.models.Course;
        const Storage = this.storage;


        Course.destroy({
            where : {
                code : request.params.id
            }
        })
        .then(count => {
            const tail = request.tail('delete course folder');
            Storage.deleteCourse(request.params.id).then(tail);
            return reply({count: count});
        })
        .catch(err => reply(Boom.badImplementation('An internal server error occurred : ' + err)));
    }
};

exports.deleteTags = {
    description: 'Delete a list of tags from the course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code'),
        },
        payload: {
            tags: Joi.array().items(Joi.string())
        }
    },
    handler: function (request, reply) {
        const Tag = this.models.Tag;
        const Course = this.models.Course;

        Tag
        .findAll({where: { name: { $in: request.payload.tags } }})
        .then(tags => {
            internals.findCourseByCode(Course, request.params.id)
            .then(course => course.remoteTags(tags).then(reply(course.get({plain:true}))));
        })
        .catch(err => reply(Boom.badImplementation('An internal server error occurred : ' + err)));
    }
};

exports.deleteTeachers = {
    description: 'Delete a list of teachers from the course',
    validate: {
        params: {
            id: Joi.string().alphanum().required().description('Course code'),
        },
        payload: {
            teachers: Joi.array().items(Joi.string())
        }
    },
    handler: function (request, reply) {
              const User = this.models.User;
        const Course = this.models.Course;

        User
        .findAll({where: { username: { $in: request.payload.teachers } }})
        .then(teachers => {
            internals.findCourseByCode(Course, request.params.id)
            .then(course => course.removeTeachers(teachers).then(reply(course.get({plain:true}))));
        })
        .catch(err => reply(Boom.badImplementation('An internal server error occurred : ' + err)));
    }
};


exports.deleteDocument = {
    description: 'Delete a document from a course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.deleteFolder = {
    description: 'Delete a document from a course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};
