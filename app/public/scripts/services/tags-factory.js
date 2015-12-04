'use strict';

angular.module('hapi-learning')
    .factory('TagsFactory', ['Restangular', '$q', function (Restangular, $q) {


        var exports = {};

        exports.add = function (value) {
            internals.tags.push(value);
        };

        exports.load = function () {
            return Restangular.all('tags').getList();
        };

        exports.create = function(tag) {
            return Restangular.all('tags').customPOST(tag);
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
