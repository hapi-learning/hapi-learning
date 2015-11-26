'use strict';

angular.module('hapi-learning')
    .factory('FilesFactory', [
        'Restangular',
        '$q',
        '$http', function(Restangular, $q, $http) {

        var internals = {};
        var exports = {};

        internals.replacePath = function(path) {

            // ui router does not replace %2F by / ...
            // (but does replace %20 by space)
            path = path.replace(/%2F/g, '/');

            if (path[0] === '/') {
                path = path.substr(1);
            }

            return path;
        };

        internals.getUrl = function(course, path) {
            path = internals.replacePath(path);
            return Restangular.configuration.baseUrl + '/courses/' + course + '/documents/' + path;
        };


        internals.get = function(course, path, showHidden) {
            return $q(function(resolve, reject) {

                path = internals.replacePath(path);

                Restangular
                    .one('courses', course)
                    .all('tree')
                    .customGET(encodeURIComponent(path), {
                        hidden: showHidden
                    })
                    .then(function(results) {
                        resolve(results);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            });
        };

        exports.getUploadPath = function(course, path) {
            path = internals.replacePath(path);
            path = encodeURIComponent(path);
            return Restangular.configuration.baseUrl + '/courses/' + course + '/documents/' + path;
        };

        exports.getList = function(course, path, showHidden) {
            return internals.get(course, path, showHidden);
        };

        exports.updateFolder = function(course, path, newName, hidden) {

            var d = $q.defer();

            path = internals.replacePath(path);
            Restangular
                .one('courses', course)
                .all('folders')
                .customOperation('patch', encodeURIComponent(path), null, null, {
                    name: newName,
                    hidden: hidden
                }).then(function() {
                    d.resolve();
                }).catch(function() {
                    d.reject('Invalid name');
                });

            return d.promise;
        };

        exports.createFolder = function(course, path, hidden) {

            return $q(function(resolve, reject) {
                path = internals.replacePath(path);
                Restangular
                    .one('courses', course)
                    .all('folders')
                    .customPOST(null, encodeURIComponent(path), {
                        hidden: hidden
                    })
                    .then(function() {
                        resolve();
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            });
        };

        exports.deleteDocument = function(course, path) {
            return $q(function(resolve, reject) {
                path = internals.replacePath(path);
                console.log(path);
                Restangular
                    .one('courses', course)
                    .all('documents')
                    .customOperation('remove', null, null, {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }, {
                        files: path
                    })
                    .then(function() {
                        resolve();
                    }).catch(function(err) {
                        console.log(err);
                        reject();
                    });
            });
        };


        exports.download = function(course, path) {

            var url = internals.getUrl(course, path);

            $http({
                url: url,
                method: 'GET',
                responseType: 'arraybuffer'
            }).then(function(results) {

                var disposition = results.headers('Content-Disposition');
                var contentType = results.headers('Content-Type');
                var filename = decodeURIComponent(disposition.substr(21)); // get filename
                var file = new Blob([results.data], {type: contentType });

                saveAs(file, filename, true);

            }).catch(function(err) {
                console.log(err);
            });

        };

        return exports;

    }]);
