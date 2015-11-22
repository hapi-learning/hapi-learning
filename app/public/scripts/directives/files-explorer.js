'use strict';

angular.module('hapi-learning')
    .directive('filesExplorer', [
        'FilesFactory', '$q', '$state', '$stateParams',
        function (FilesFactory, $q, $state, $stateParams) {

        return {
            restrict: 'E',
            templateUrl: 'scripts/directives/files-explorer.html',
            scope: {
                code: '='
            },
            link: function(scope, elem, attrs, ctrl) {

                scope.path = $stateParams.path;
                scope.files = {};
                scope.uploading = false;
                scope.fetching = null;

                scope.getList = function(path) {
                    scope.fetching = true;
                    return $q(function(resolve, reject) {
                        FilesFactory.getList(scope.code, path).then(function(files) {
                            scope.files.dir = files.dir;
                            scope.files.files = files.files;
                            scope.fetching = false;
                            resolve();
                        }).catch(reject);
                    });
                };

                scope.upload = function() {

                };

                scope.download = function() {
                    return FilesFactory.download(scope.code, $stateParams.path);
                };

                scope.downloadFile = function(file) {

                    return FilesFactory.download(scope.code, $stateParams.path + '/' + file);

                };

                scope.goToAbsolutePath = function(path) {
                    $state.go('root.course.documents', {
                        code: scope.code,
                        path: path
                    });
                };

                scope.goToRelativePath = function(path) {

                    var tmp = $stateParams.path === '/' ? '' : '/';

                    $state.go('root.course.documents', {
                        code: scope.code,
                        path: $stateParams.path + tmp + path
                    });
                };

                scope.goToParent = function() {
                    var path = scope.files.dir;
                    console.log(scope.files.dir);
                    if (path !== '') {
                        path = '/' + path;
                    }
                    scope.goToAbsolutePath(path);
                };


                scope.getList($stateParams.path);
            }
        };
    }]);
