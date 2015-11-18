'use strict';

const _    = require('lodash');
const Hoek = require('hoek');
const Boom = require('boom');

const internals = {};

internals.validatePermissions = function(permissions) {

    Hoek.assert(Array.isArray(permissions), 'permissions must be an array');

    _.forEach(permissions, function(permission) {
        Hoek.assert(typeof permission.name === 'string', 'name must be a string');
        Hoek.assert(Array.isArray(permission.acl), 'acl must be an array');
        _.forEach(permission.acl, function(acl) {
            Hoek.assert(typeof acl === 'string', 'acl must be an array of strings only');
        });
    });
};

internals.checkPermission = function(permissions) {

    _.forEach(permissions, function(permission) {
      //  const routePermissions = internals.routes
    // TODO - map with route path -> permission instead of array in internals.route
    });

    return true;
};

exports.register = function(server, options, next) {

    // Initialization
    internals.routes = [];
    const routingTable = server.table(); // Routing table for all the connections

    // Get the routing table for each connection.
    // Take route configuration
    // Check the validity of the configuration
    // Push to the internals settings the configuration
    _.forEach(routingTable, function(connection) {

        // Routing table for one connection
        const table = connection.table;

        _.forEach(table, function(item) {
            const settings = item.settings;

            if (settings.plugins.permissions) {

                const pluginSettings = settings.plugins.permissions;

                // Validate permissions array
                internals.validatePermissions(pluginSettings);

                // Push to array
                internals.routes.push({
                    path: item.path,
                    method: item.method,
                    settings: pluginSettings
                });
            }
        });

    // End initialization

    });

    server.ext('onPostAuth', function(request, reply) {

        const permissions = request.permissions;

        internals.validatePermissions(permissions);

        // If invalid permissions -> forbidden, otherwise continue
        if (!internalscheckPermissions(permissions)) {
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
