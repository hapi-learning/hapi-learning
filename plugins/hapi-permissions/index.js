'use strict';

const _    = require('lodash');
const Hoek = require('hoek');
const Boom = require('boom');

const internals = {};

internals.validatePermissions = function(permissions) {

    Hoek.assert(Array.isArray(permissions), 'permissions must be an array');

    _.each(permissions, function(permission) {
        Hoek.assert(typeof permission.name === 'string', 'name must be a string');
        Hoek.assert(Array.isArray(permission.acl), 'acl must be an array');
        _.each(permission.acl, function(acl) {
            Hoek.assert(typeof acl === 'string', 'acl must be an array of strings only');
        });
    });
};

internals.checkPermission = function(request, permissions) {

    const path = request.route.path;
    if (internals.settings.has(path)) {
        const settings = internals.settings.get(path);

        _.each(permissions, function(permission, index) {
            const aclRequired = settings[index].acl;
            const acl = permission.acl;


            return _.eq(aclRequired, _.intersection(acl, aclRequired));
        });
    } else {
        return true; // The route is not concerned by permission
    }
};

exports.register = function(server, options, next) {

    // Initialization
    internals.settings = new Map();
    const routingTable = server.table(); // Routing table for all the connections

    // Get the routing table for each connection.
    // Take route configuration
    // Check the validity of the configuration
    // Push to the internals settings the configuration
    _.each(routingTable, function(connection) {

        // Routing table for one connection
        const table = connection.table;

        _.each(table, function(item) {
            const settings = item.settings;

            if (settings.plugins.permissions) {

                const pluginSettings = settings.plugins.permissions;

                // Validate permissions array
                internals.validatePermissions(pluginSettings);

                // Add to map
                internals.settings.set(item.path, pluginSettings);
            }
        });

    // End initialization

    });

    server.ext('onPostAuth', function(request, reply) {

        const permissions = request.permissions;

        internals.validatePermissions(permissions);

        // If invalid permissions -> forbidden, otherwise continue
        if (!internals.checkPermissions(request, permissions)) {
            return reply(Boom.forbidden('Cannot execute action'));
        } else {
            return reply.continue();
        }
    });

    next();

};

exports.register.attributes = {
    name: require('./package.json').name,
    version: require('./package.json').version
};
