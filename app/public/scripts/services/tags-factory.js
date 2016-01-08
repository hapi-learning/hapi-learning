'use strict';

angular.module('hapi-learning.services')
    .factory('TagsFactory', ['Rip', '$q', function (Rip, $q) {


        var exports = {};
        var internals = {};
        internals.tags = new Rip.Model('tags');

        exports.add = function (value) {
            // used ?
            internals.tags.push(value);
        };

        exports.load = function () {

            return internals.tags.get();
        };

        exports.create = function(tag) {

            return internals.tags.post(tag);
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
