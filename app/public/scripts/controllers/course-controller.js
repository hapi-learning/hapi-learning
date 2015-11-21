'use strict';

angular.module('hapi-learning')
    .controller('CourseCtrl', [
        '$scope', '$stateParams',
        'CoursesFactory', 'LoginFactory',
        'FilesFactory', '$state',

        function ($scope, $stateParams,
                  CoursesFactory, LoginFactory, FilesFactory, $state) {

            // If stateParams changed, update course
            if ($scope.course && $stateParams.code !== $scope.course.code) {
                $scope.update = true;
            }

            if (!$scope.course || $scope.update) {

                CoursesFactory.loadSpecific($stateParams.code)
                .then(function (course) {
                    if (course)
                    {
                        $scope.course = {};
                        $scope.course.name = course.name;
                        $scope.course.description = course.description || 'This page is empty.';
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

            $scope.getTree = function(path) {
                return FilesFactory.getTree($scope.course.code, path);
            };

    }]);
