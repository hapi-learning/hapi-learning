'use strict';

const _ = require('lodash');

const internals = {};
internals.removeDates = function(sequelizeObject) {
    return _.omit(sequelizeObject.get({plain: true}), 'updated_at', 'created_at', 'deleted_at');
};

internals.removeDatesArray = function(sequelizeObjects) {
    return _.map(sequelizeObjects, (sequelizeObject => internals.removeDates(sequelizeObject)));
};

internals.extractUser = function(payload_user) {
    return _.pick(payload_user, 'username', 'password', 'email', 'firstName', 'lastName', 'phoneNumber');
};

internals.extractUsers = function(payload_users) {
    return _.map(payload_users, user => this.extractUser(user));
};

module.exports = {
    removeDates: function (result) {
        if (Array.isArray(result)) {
            return internals.removeDatesArray(result);
        } else {
            return internals.removeDates(result);
        }
    },
    extractUsers : function (payload) {
        if (Array.isArray(payload)) {
            return internals.extractUsers(payload);
        }
        else {
            return internals.extractUser(payload);    
        }
    }
};

