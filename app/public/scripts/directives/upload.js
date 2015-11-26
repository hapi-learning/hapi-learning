'use strict';

// Import restangular for now because it stores the base url
angular.module('hapi-learning')
    .directive('upload', ['$rootScope', 'FileUploader', 'Restangular', 'AuthStorage',
                          function ($rootScope, FileUploader, Restangular, AuthStorage) {
        return {
            restrict: 'E',
            scope : {
                path : '='
            },
            templateUrl: 'scripts/directives/upload.html',

            // Compile function needed to create uploader before other directives
            compile: function() {
                return {
                    pre: function(scope, elem, attrs) {
                        scope.uploader = new FileUploader({
                            url: scope.path,
                            headers: {
                                Authorization: AuthStorage.get('token')
                            }
                        });

                        scope.uploader.onAfterAddingFile = function(item) {
                            item.file.visible = true;
                        };

                        scope.uploader.onBeforeUploadItem = function(item) {
                            item.url = scope.uploader.url + '?hidden=' + (!item.file.visible);
                        };

                        scope.uploader.onErrorItem = function(item, response, status, headers) {
                            $rootScope.$emit('upload-error');
                        };

                        scope.uploader.onCompleteAll = function(item, response, status, headers) {
                            $rootScope.$emit('upload-complete');
                        };

                        scope.isVisible = function(item) {
                            return item.file.visible;
                        };

                        scope.toggleFileVisible = function(item) {
                            item.file.visible = !item.file.visible;
                        };

                        scope.fileChooser = function () {
                            angular.element('#fileSelect').trigger('click');
                        };
                    }
                };
            }
        };
    }]);
