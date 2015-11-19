angular.module('hapi-learning')
    .controller('FilesCtrl', ['$scope', '$stateParams',
                               'CoursesFactory', 'LoginFactory',
                               'FilesFactory',
                function ($scope, $stateParams,
                          CoursesFactory, LoginFactory,
                          FilesFactory) {

            $scope.course = {};

            $scope.getTree = function(path) {
                return FilesFactory.getTree($scope.course.code, path);
            };

    }]);
