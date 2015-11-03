'use strict';

exports.get = {
    description: 'Get one user',
    validate: {
        params: {
            id: Joi.number().integer().required().description('Course id')
        }
    },
    handler: function(request, reply) {
        console.log(request.headers.authorization);
        reply('Not implemented');
    }
};

exports.getAll = {
    description: 'Get all users',
    validate: {
        params: {
            id: Joi.string().min(1).max(255).required().description('User personal ID')
        }
    },
    handler: function(request, reply) {
        reply('Not implemented');
    }
};

exports.post = {
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

