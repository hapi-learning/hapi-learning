'use strict';

angular.module('hapi-learning')
    .directive('upload', ['$rootScope', 'FileUploader', 'AuthStorage', '$translate',
                          function ($rootScope, FileUploader, AuthStorage, $translate) {
        return {
            restrict: 'E',
            templateUrl: 'components/upload/upload.html',

            // Compile function needed to create uploader before other directives
            compile: function() {
                return {
                    pre: function(scope, elem, attrs) {
                        scope.path = scope.$eval(attrs.path);
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

                        $translate('FILE-EXPLORER.UPLOAD.BUTTONS.SELECT').then(function (button) {
                            elem.find(':file').filestyle({
                                buttonName: "btn-primary",
                                buttonText: button,
                                badge: false,
                                input: false
                            });
                        });
                    }
                };
            }
        };
    }]);
