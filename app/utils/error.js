const Boom = require('boom');

exports.badImplementation = function(reply, error) {
    return reply(Boom.badImplementation('An internal server error occurred : ' + error))
};

exports.notImplemented = function(reply) {
    return reply(Boom.notImplemented('Method not implemented'));
}
