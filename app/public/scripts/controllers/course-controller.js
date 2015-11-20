angular.module('hapi-learning')
    .controller('CourseCtrl', ['$scope', '$stateParams',
                               'CoursesFactory', 'LoginFactory',
                               '$state',
                function ($scope, $stateParams,
                          CoursesFactory, LoginFactory, $state) {


            $scope.updateCourse = false;

            if (!$scope.course && !$scope.updateCourse) {
                CoursesFactory.loadSpecific($stateParams.code)
                .then(function (course) {
                    if (course)
                    {
                        $scope.course = {};
                        $scope.course.name = course.name;
                        $scope.course.description = course.description || 'This page is empty.'
                        $scope.course.code = course.code;
                        $scope.course.teachers = course.teachers;
                        $scope.course.tags = course.tags;
                    }
                    else
                    {
                        $state.go('root.home');
                    }
                })
                .catch(function (error) {
                    $state.go('root.home');
                });
            }
    }]);
