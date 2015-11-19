angular.module('hapi-learning')
    .controller('CourseCtrl', ['$scope', '$stateParams',
                               'CoursesFactory', 'LoginFactory',
                               'FilesFactory',
                function ($scope, $stateParams,
                          CoursesFactory, LoginFactory,
                          FilesFactory) {

            $scope.course = {};

            $scope.getTree = function(path) {
                return FilesFactory.getTree($scope.course.code, path);
            };

            CoursesFactory.loadSpecific($stateParams.code)
            .then(function (course) {
                if (course)
                {
                    $scope.course.name = course.name;
                    $scope.course.description = course.description;
                    $scope.course.code = course.code;
                    $scope.course.teachers = course.teachers;
                    $scope.course.tags = course.tags;
                }
                else
                {
                    console.log('Course not found');
                }
            })
            .catch(function (error) {console.log(error);});
    }]);
