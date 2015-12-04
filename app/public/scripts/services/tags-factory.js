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
            var d = $q.defer();

            if (internals.tags.length === 0)
            {
                Restangular
                .all('tags')
                .getList()
                .then(function(tags) {
                    internals.tags = tags;
                    d.resolve(tags);
                })
                .catch(function() {
                    d.reject();
                });
            }
            else
            {
                d.resolve(internals.tags);
            }

            return d.promise;
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
