'use strict';

const Boom = require('boom');

exports.register = function(server, options, next) {


    server.decorate('reply', 'badImplementation', function(error) {
        return this.response(Boom.badImplementation('An internal server error has occured. ' + error));
    });

    server.decorate('reply', 'notImplemented', function(message) {
        return this.response(Boom.notImplemented(message || 'Method not implemented'));
    });

    server.decorate('reply', 'notFound', function(message) {
        return this.response(Boom.notFound(message || 'Resource not found'));
    });

    server.decorate('reply', 'conflict', function(message) {
        message = message || 'A conflict has occured, resource may already exists or be deleted';
        return this.response(Boom.conflict(message));
    });

    server.decorate('reply', 'badRequest', function(message) {
        return this.response(Boom.badRequest(message || 'Bad request'));
    });

    server.decorate('reply', 'badData', function(message) {
        return this.response(Boom.badData(message || 'Bad data'));
    });

    // Add more common error here

    next();
};


exports.register.attributes = {
    name: 'hapi-error',
    version: require('../../package.json').version
};
