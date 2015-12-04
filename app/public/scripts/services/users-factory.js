'use strict';

angular.module('hapi-learning')
    .factory('UsersFactory', ['Restangular', '$q', function (Restangular, $q) {

        var exports = {};

        exports.create = function(users) {
            var d = $q.defer();

            Restangular.all('users')
                .customPOST(users)
                .then(function(res) {
                    d.resolve(res);
                })
                .catch(function(error) {
                    d.reject(error);
                });

            return d.promise;
        };

        return exports;
}]);
