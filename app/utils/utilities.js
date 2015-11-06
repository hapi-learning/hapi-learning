(function () {
    "use strict";

    const _ = require('lodash');

    module.exports = {
        clean_result: function (sequelize_result) {
            return _.omit(
                sequelize_result.get({
                    plain: true
                }),
                'updated_at',
                'created_at',
                'deleted_at'
            ) || {};
        },
        clean_results: function (sequelize_results) {
            return _.map(sequelize_results, (result => this.clean_result(result))) || [];
        },
        extractUser : function(payload_user) {
            return _.pick(payload_user, 'username', 'password', 'email', 'firstName', 'lastName', 'phoneNumber') || {};
        },
        extractUsers : function(payload_users) {
            return _.map(payload_users, user => this.extractUser(user));
        }
    };

}());
