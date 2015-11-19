angular.module('hapi-learning')
    .directive('upload', ['FileUploader', 'Restangular', function (FileUploader, Restangular) {
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
                        var path = Restangular.configuration.baseUrl + '/';

                        if (attrs.path) {
                            path += attrs.path;
                        }

                        scope.uploader = new FileUploader({
                            url: path
                        });
                    }
                }
            },
            link: function(scope, elem, attrs) {

                scope.uploader.onAfterAddingFile = function(item) {
                    item.file.visible = true;
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
    }]);
