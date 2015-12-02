'use strict';

angular.module('hapi-learning')
    .factory('UsersFactory', ['Restangular', '$q', function (Restangular, $q) {

        var exports = {};

        exports.create = function(users) {
            var d = $q.defer();

            console.log(users);
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

        exports.createOne = function(user) {

        };

        exports.createMany = function(users) {

        };


        return exports;
}]);
