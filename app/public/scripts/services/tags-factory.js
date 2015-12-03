'use strict';

angular.module('hapi-learning')
    .factory('TagsFactory', ['Restangular', '$q', function (Restangular, $q) {

        var internals = {};
        internals.tags = [];

        var exports = {};
        exports.add = function (value) {
            internals.tags.push(value);
        };

        exports.load = function () {
            return new Promise(function (resolve, reject) {
                if (internals.tags.length === 0)
                {
                    Restangular
                    .all('tags')
                    .getList()
                    .then(function(tags) {
                        internals.tags = tags;
                        resolve(tags);
                    })
                    .catch(reject);
                }
                else
                {
                    resolve(internals.tags);
                }
            });
        };

        exports.create = function(tag) {
            return Restangular.all('tags')
                .customPOST(tag);
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
