'use strict';

const _ = require('lodash');

const internals = {};
internals.removeDates = function(sequelizeObject) {
    return _.omit(sequelizeObject.get({plain: true}), 'updated_at', 'created_at', 'deleted_at');
};

internals.removeDatesArray = function(sequelizeObjects) {
    return _.map(sequelizeObjects, (sequelizeObject => internals.removeDates(sequelizeObject)));
};

module.exports = {
    removeDates: function (result) {
        if (Array.isArray(result)) {
            internals.removeDatesArray(result);
        } else {
            internals.removeDates(result);
        }
    }
};

