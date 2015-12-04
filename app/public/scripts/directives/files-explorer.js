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

                scope.folder = {};
                scope.creatingFolder = false;
                scope.folderError = false;
                scope.uploadError = false;
                scope.showHidden = $stateParams.showHidden;

                scope.getUploadPath = function() {
                    return FilesFactory.getUploadPath(scope.code, $stateParams.path);
                };

                scope.getList = function(path, showHidden) {

                    scope.fetching = true;
                    return $q(function(resolve, reject) {
                        FilesFactory.getList(scope.code, path, showHidden).then(function(results) {
                            scope.files.dir = results.dir;
                            scope.files.files = results.files;
                            scope.fetching = false;
                            resolve();
                        }).catch(reject);
                    });
                };

                scope.$watch('showHidden', function(value) {
                    scope.getList($stateParams.path, value);
                });

                scope.cleanFolderError = function() {
                    scope.folderError = false;
                };

                scope.cleanFolderName = function() {
                    scope.folder = {};
                    scope.creatingFolder = false;
                    scope.cleanFolderError;
                };

                scope.createFolder = function() {

                    var name = scope.folder.name;
                    var hidden = scope.folder.hidden;

                    var path = $stateParams.path + '/' + name;

                    FilesFactory.createFolder(scope.code, path, hidden).then(function() {
                        scope.cleanFolderName();
                        scope.getList($stateParams.path, scope.showHidden);
                    }).catch(function(error) {
                        scope.folderError = true;
                    });
                };

                scope.cleanUploadError = function() {
                    scope.uploadError = false;
                };

                scope.download = function() {
                    return FilesFactory.getDownloadPath(scope.code, $stateParams.path, scope.showHidden);
                    //return FilesFactory.download(scope.code, $stateParams.path, scope.showHidden);
                };

                scope.getDownloadPath = function(file) {
                    return FilesFactory.getDownloadPath(scope.code, $stateParams.path + '/' + file, scope.showHidden);
                }

                scope.downloadFile = function(file) {
                    return FilesFactory.download(scope.code, $stateParams.path + '/' + file, scope.showHidden);
                };

                scope.goToAbsolutePath = function(path) {
                    $state.go('root.course.documents', {
                        code: scope.code,
                        path: path,
                        showHidden: scope.showHidden
                    });
                };

                scope.goToRelativePath = function(path) {

                    var tmp = $stateParams.path === '/' ? '' : '/';

                    $state.go('root.course.documents', {
                        code: scope.code,
                        path: $stateParams.path + tmp + path,
                        showHidden: scope.showHidden
                    });
                };

                scope.goToParent = function() {
                    var path = scope.files.dir;
                    if (path === '/') {
                        path = '';
                    }

                    scope.goToAbsolutePath(path);
                };

                var update = function(data, index, type) {

                    var oldName = scope.files.files[index].name;
                    var oldHidden = scope.files.files[index].hidden;

                    if (data.name === oldName && data.hidden === oldHidden) {
                        return true; // Accept and does not update
                    }

                    var path = $stateParams.path + '/' + oldName;

                    var updateLocalFile = function(file) {

                        // If files are hidden and updated is hidden,
                        // remove it from the list
                        if (!scope.showHidden && file.hidden) {
                            _.pullAt(scope.files.files, index);
                        } else {
                            scope.files.files[index].name = file.name;
                            scope.files.files[index].hidden = file.hidden;
                            scope.files.files[index]['updated_at'] = file['updated_at'];
                        }

                        scope.cleanFolderError();
                    };

                    var promise = type === 'f' ?
                        FilesFactory.updateFile(scope.code, path, data.name, data.hidden) :
                        FilesFactory.updateFolder(scope.code, path, data.name, data.hidden);

                    return promise.then(function(file) {
                        updateLocalFile(file);
                        return true;
                    }).catch(function(err) {
                        if (err.status === 409) {
                            scope.folderError = true;
                            return err.statusText;
                        }
                    });

                }

                scope.updateFolder = function(data, index) {
                    return update(data, index, 'd');
                };

                scope.updateFile = function(data, index) {
                    return update(data, index, 'f');
                };

                scope.removeFile = function(index) {
                    var name = scope.files.files[index].name;
                    var path = $stateParams.path + '/' + name;

                    FilesFactory.deleteDocument(scope.code, path)
                        .then(function() {
                            scope.getList($stateParams.path, scope.showHidden);
                        }).catch(function() {
                            console.log('error - cannot delete');
                        });

                };

                $rootScope.$on('upload-complete', function() {
                    scope.getList($stateParams.path, scope.showHidden);
                });

                $rootScope.$on('upload-error', function() {
                    scope.uploadError = true;
                });


                // Set this back if bug appears again.

                if (scope.code) {
                    scope.getList($stateParams.path, scope.showHidden);
                } else {
                    // The code can be undefined because of asynchronous calls
                    scope.$watch('code', function(value) {

                        if (value) {
                            scope.getList($stateParams.path, scope.showHidden);
                        }
                    });
                }
            }
        };
    }]);
