'use strict';

const Joi = require('joi');
const Boom = require('boom');





exports.getAll = {
    description: 'List all the courses',
    auth: false,
    handler: function (request, reply) {

        const Course = this.models.Course;
        const User = this.models.User;

        Course.findAll().then(results => {

        });
    }
};


exports.get = {
    description: 'Get info for one course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.getDocuments = {
    description: 'Get a ZIP containing all course documents',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id'),
            path: Joi.string() // TODO - FIX
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
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

exports.getTags = {
    description: 'Get tags related to the course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};

exports.getTeachers = {
    description: 'Get teachers giving the course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
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
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.post = {
    description: 'Add a course',
    validate: {
        payload: {
            name: Joi.string().min(1).max(255).required().description('Course name'),
            code: Joi.string().min(1).max(255).required().description('Course code'),
            description: Joi.string().min(1).max(255).description('Course description'),
            titulars: Joi.array().items(Joi.string()).description('Teachers'),
            tags: Joi.array().items(Joi.string()).description('Tags')
        }
    },
    handler: function (request, reply) {

        const Course = this.models.Course;
        const User = this.models.User;
        const Tag = this.models.Tag;

        const hasTitulars = request.payload.titulars ? true : false;
        const hasTags = request.payload.tags ? true : false;
        const coursePayload = {
            name: request.payload.name,
            code: request.payload.code,
            description: request.payload.description
        };

        // If tags has been passed to the payload, return a promise
        // loading the tags, otherwise return a promise returning an empty array
        const getTags = hasTags
            ? Promise.resolve(Tag.findAll(
                {where: {name: {$in: request.payload.tags}}}))
            : Promise.resolve([]);

        // If titulars has been passed to the payload, return a promise
        // loading the titulars, otherwise return a promise returning an empty array
        const userExclude = ['password'];
        const getTitulars = hasTitulars
            ? Promise.resolve(User.findAll(
                {where: {username: {$in: request.payload.titulars}},
                 attributes: {exclude: userExclude}}))
            : Promise.resolve([]);

        // Loads tags and titulars to be added
        Promise
        .all([getTags, getTitulars])
        .then(values => {

                const tags = values[0];
                const titulars = values[1];

                const wrongTitulars = (hasTitulars && titulars.length !== request.payload.titulars.length);
                const wrongTags = (hasTags && tags.length !== request.payload.tags.length);

                if (wrongTitulars || wrongTags)
                {
                    return reply(Boom.badData(wrongTitulars ? 'Invalid titular(s)' : 'Invalid tag(s)'));
                }
                else
                {
                    // TODO - Should refactor this somewhere else.
                    // Create course
                    Course
                    .create(coursePayload)
                    .then(newCourse => {

                        // Add titulars and tags to the new added course
                        Promise
                        .all([newCourse.addTitulars(titulars), newCourse.addTags(tags)])
                        .then(() => {

                            // Build response
                            let course = newCourse.get({plain:true});
                            course.tags = [];
                            course.titulars = [];
                            tags.forEach(t => course.tags.push(t.get('name', {plain:true})));
                            titulars.forEach(t => course.titulars.push(t.get('username', {plain:true})));

                            return reply(JSON.stringify(course, null, 4));
                        });
                    })
                    .catch((err) => {
                        return reply(Boom.conflict('Conflict'));
                    });
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


exports.put = {
    description: 'Modify a course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.delete = {
    description: 'Delete a course',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function (request, reply) {
        reply('Not implemented');
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
