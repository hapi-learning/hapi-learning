angular.module('hapi-learning')
    .directive('filesExplorer', ['FilesFactory', function (FilesFactory) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/directives/files-explorer.html',
            link: function(scope, elem, attrs, ctrl) {
                scope.getTree = function() {
                  //  FilesFactory.getTree()
                };
            },
            controller: 'CourseCtrl',
            controllerAs: 'ctrl'
        };
    });
