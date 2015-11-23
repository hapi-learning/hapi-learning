'use strict';

angular.module('hapi-learning')
    .directive('filesExplorer', [
        '$rootScope', 'FilesFactory', '$q', '$state', '$stateParams',
        function ($rootScope, FilesFactory, $q, $state, $stateParams) {

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

                scope.folderName = '';
                scope.creatingFolder = false;
                scope.folderError = false;
                scope.uploadError = false;
                scope.editing = false;

                scope.getUploadPath = function() {
                    return FilesFactory.getUploadPath(scope.code, $stateParams.path);
                };

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

                scope.cleanFolderName = function() {
                    scope.folderName = "";
                    scope.creatingFolder = false;
                    scope.folderError = null;
                };

                scope.createFolder = function(path) {

                    path = $stateParams.path + '/' + path;

                    FilesFactory.createFolder(scope.code, path).then(function() {
                        scope.cleanFolderName();
                        scope.getList($stateParams.path);
                    }).catch(function(error) {
                        scope.folderError = true;
                    });
                };

                scope.cleanUploadError = function() {
                    scope.uploadError = false;
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
                    if (path !== '') {
                        path = '/' + path;
                    }
                    scope.goToAbsolutePath(path);
                };

                $rootScope.$on('upload-complete', function() {
                    scope.getList($stateParams.path);
                });

                $rootScope.$on('upload-error', function() {
                    scope.uploadError = true;
                });

                $rootScope.$on('course-begin-edit', function() {
                    scope.editing = true;
                });

                $rootScope.$on('course-confirm-edit', function() {
                    scope.editing = false;
                });

                $rootScope.$on('course-cancel-edit', function() {
                    scope.editing = false;
                });

                // Set this back if bug appears again.

                if (scope.code) {
                    scope.getList($stateParams.path);
                } else {
                    // The code can be undefined because of asynchronous calls
                    scope.$watch('code', function(value) {

                        if (value) {
                            scope.getList($stateParams.path);
                        }
                    });
                }
            }
        };
    }]);
