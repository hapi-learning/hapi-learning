'use strict';

angular.module('hapi-learning')
    .factory('FilesFactory', [
        'Restangular',
        '$q',
        '$http', function(Restangular, $q, $http) {

        var internals = {};
        var exports = {};

        internals.replacePath = function(path) {
            path = path.replace('%2F', '/');

            if (path[0] === '/') {
                path = path.substr(1);
            }

            return path;
        };

        internals.get = function(course, path, recursive) {
            return $q(function(resolve, reject) {

                path = internals.replacePath(path);

                Restangular
                    .one('courses', course)
                    .all('tree')
                    .customGET(path, { recursive: recursive })
                    .then(function(results) {
                        resolve(results);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            });
        };

        exports.getList = function(course, path) {
            return internals.get(course, path, false);
        };

        exports.getTree = function(course, path) {
            return internals.get(course, path, true);
        };

        exports.getDownloadPath = function(course, path) {
            //path = internals.replacePath(path);
            path = path.replace('%2F', '/')
            var url = Restangular.configuration.baseUrl + '/courses/' + course + '/documents' + path
            return url;
        };

        exports.download = function(course, path) {

            var url = exports.getDownloadPath(course, path);
            $http.get(url).then(function(results) {

                var disposition = results.headers('Content-Disposition')
                var contentType = results.headers('Content-Type');
                var filename = disposition.substr(21);

                var file;

                if (contentType === 'application/zip') {
                    var strToBytes = function (str) {
                        var bytes = new Uint8Array(str.length);
                        for (var i=0; i<str.length; i++) {
                            bytes[i] = str.charCodeAt(i);
                        }
                        return bytes;
                    };

                    file = new Blob([strToBytes(results.data)], {type: contentType });
                } else {
                    file = new Blob([results.data], { type: contentType });
                }

                saveAs(file, filename, true);

            }).catch(function(err) {
                console.log(err);
            });

        };

        return exports;

    }]);
