'use strict';

exports.getAll = {
    description: 'List all the courses',
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.get = {
    description: 'Get info for one course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.getDocuments = {
    description: 'Get a ZIP containing all course documents',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.getDocument = {
    description: 'Get one document of the course',
    validate: {
        id: Joi.number().integer().required().description('Course id'),
        path : Joi.string()//TODO
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.getTree = {
    description: 'Get course folder tree',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.getFolderTree = {
    description: 'Get folder tree',
    validate: {
        id: Joi.number().integer().required().description('Course id'),
        path : Joi.string()//TODO
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.getTags = {
    description: 'Get tags related to the course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};

exports.getTeachers = {
    description: 'Get teachers giving the course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};

exports.getStudents = {
    description: 'Get students following the course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.post = {
    description: 'Add a course',
    validate: {
        name : Joi.string().min(1).max(255).required().description('Course name'),
        code : Joi.string().min(1).max(255).required().description('Course code'),
        description : Joi.string().min(1).max(255).description('Course description')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.postDocument = {
    description: 'Upload a file to a course',
    validate: {
       id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.put = {
    description: 'Modify a course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.delete = {
    description: 'Delete a course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.deleteDocument = {
    description: 'Delete a document from a course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};


exports.deleteFolder = {
    description: 'Delete a document from a course',
    validate: {
        id: Joi.number().integer().required().description('Course id')
    },
    handler: function (request, reply) {
        reply('Not implemented');
    }
};
