'use strict';

angular.module('hapi-learning')
    .controller('CourseCtrl', ['$scope', '$stateParams',
                               'CoursesFactory', 'LoginFactory',
                               'FilesFactory', '$state',
                function ($scope, $stateParams,
                          CoursesFactory, LoginFactory, FilesFactory, $state) {
            
            $scope.update = false;
            $scope.course = null;
            
            // If stateParams changed, update course
            if ($scope.course && $stateParams.code !== $scope.course.code) {
                $scope.update = true;
            }

            if (!$scope.course || $scope.update) {

                CoursesFactory.loadSpecific($stateParams.code)
                .then(function (course) {
                    if (course)
                    {
                        $scope.course = {
                            name : course.name,
                            description : course.description || 'This page is empty.',
                            code : course.code,
                            teachers : course.teachers,
                            tags : course.tags
                        };
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
