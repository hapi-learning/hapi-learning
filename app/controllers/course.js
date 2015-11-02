server.route([
        {method: 'GET',    path: '/courses',                       config: Controllers.Course.getAll},
        {method: 'GET',    path: '/courses/{id}',                  config: Controllers.Course.get},
        {method: 'GET',    path: '/courses/{id}/documents',        config: Controllers.Course.getDocuments},
        {method: 'GET',    path: '/courses/{id}/documents/{path}', config: Controllers.Course.getPath},
    
        {method: 'GET',    path: '/courses/{id}/tree',             config: Controllers.Course.getTree},
        {method: 'GET',    path: '/courses/{id}/tree/{path}',      config: Controllers.Course.getFolderTree},
    
        {method: 'GET',    path: '/courses/{id}/tags',             config: Controllers.Course.getTags},
        {method: 'GET',    path: '/courses/{id}/teachers',         config: Controllers.Course.getTeachers},
        {method: 'GET',    path: '/courses/{id}/students',         config: Controllers.Course.getStudents},
    
        {method: 'POST',   path: '/courses',                       config: Controllers.Course.post},
        {method: 'POST',   path: '/courses/{id}/documents',        config: Controllers.Course.postDocument},
        {method: 'POST',   path: '/courses/{id}/documents/{path}', config: Controllers.Course.postDocument},
    
        {method: 'PUT',    path: '/courses/{id}',                  config: Controllers.Course.put},
    
        {method: 'DELETE', path: '/courses/{id}',                  config: Controllers.Course.delete},
        {method: 'DELETE', path: '/courses/{id}/documents',        config: Controllers.Course.deleteDocument},
        {method: 'DELETE', path: '/courses/{id}/documents/{path}', config: Controllers.Course.deleteFolder}
    
    ]);



exports.getAll = {
    description: 'List all the courses',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.get = {
    description: 'Get info for one course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.getDocuments = {
    description: 'Get a ZIP containing all course documents',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.getDocument = {
    description: 'Get one document of the course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.getTree = {
    description: 'Get course folder tree',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.getFolderTree = {
    description: 'Get folder tree',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.getTags = {
    description: 'Get tags related to the course',
    validate: {

    },
    handler: function(request, reply) {

    }
};

exports.getTeachers = {
    description: 'Get teachers giving the course',
    validate: {

    },
    handler: function(request, reply) {

    }
};

exports.getStudents = {
    description: 'Get students following the course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.post = {
    description: 'Add a course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.postDocument = {
    description: 'Upload a file to a course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.put = {
    description: 'Modify a course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.delete = {
    description: 'Delete a course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.deleteDocument = {
    description: 'Delete a document from a course',
    validate: {

    },
    handler: function(request, reply) {

    }
};


exports.deleteFolder = {
    description: 'Delete a document from a course',
    validate: {

    },
    handler: function(request, reply) {

    }
};
