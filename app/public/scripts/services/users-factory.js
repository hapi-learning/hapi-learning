'use strict';

angular.module('hapi-learning.services')
    .factory('UsersFactory', ['Rip', '$q', function (Rip, $q) {

        var exports = {};
        var internals = {};

        internals.users = new Rip.Model('users');

        exports.create = function(users) {

            return internals.users().post(users);
        };

        return exports;
}]);
