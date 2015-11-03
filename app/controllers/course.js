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

        const setTags = hasTags ? Promise.resolve(Tag.findAll({
            where: {
                name: {
                    $in: request.payload.tags
                }
            }
        })) : Promise.resolve([]);

        const setUsers = hasTitulars ? Promise.resolve(User.findAll({
            where: {
                username: {
                    $in: request.payload.titulars
                }
            }
        })) : Promise.resolve([]);

        // TODO -- FIXME
        // -> Handle create (same unique key)
        // -> Return titulars and tags array

        Promise.all([setTags, setUsers])
            .then(values => {
                const tags = values[0];
                const titulars = values[1];

                const a = (hasTitulars && titulars.length !== request.payload.titulars.length);
                const b = (hasTags && tags.length !== request.payload.tags.length);

                if (a || b) {
                    return reply(Boom.badData(a ? 'Invalid titular(s)' : 'Invalid tag(s)'));
                } else {

                    Course.create({
                            name: request.payload.name,
                            code: request.payload.code,
                            description: request.payload.description
                        })
                        .then(course => {
                            Promise.all([course.addTitulars(titulars),
                                         course.addTags(tags)])
                                .then(() => {
                                    course.tags = tags;
                                    course.titulars = titulars;
                                    return reply(course);
                                });
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
