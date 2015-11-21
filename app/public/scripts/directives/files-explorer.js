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
                scope.files = [];
                scope.uploading = false;

                scope.getList = function(path) {
                    return $q(function(resolve, reject) {
                        FilesFactory.getList(scope.code, path).then(function(files) {
                            scope.files = files;
                            console.log(files);
                            resolve();

                        }).catch(reject);
                    });
                };

                scope.upload = function() {

                };

                scope.download = function(path) {

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


                scope.getList($stateParams.path);
            }
        };
    }]);
