'use strict';

angular.module('hapi-learning')
    .factory('TagsFactory', ['Restangular', function (Restangular) {

        var internals = {};
        internals.tags = [];

        var exports = {};
        exports.add = function (value) {
            internals.tags.push(value);
        };

        exports.load = function () {
            return new Promise(function (resolve, reject) {
                Restangular
                    .all('tags')
                    .getList()
                    .then(resolve)
                    .catch(reject);
            });
        };

        exports.get = function (index) {
            if (index) {
                return internals.tags[index];
            } else {
                return internals.tags;
            }
        };

        exports.clear = function () {
            internals.tags = [];
        };


        return exports;
}]);
