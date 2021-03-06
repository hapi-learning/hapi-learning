'use strict';

angular.module('hapi-learning')
    .controller('CourseCtrl', [
        '$rootScope',
        '$scope',
        '$stateParams',
        'CoursesFactory',
        'LoginFactory',
        'FilesFactory',
        '$state',
    function ($rootScope, $scope, $stateParams, CoursesFactory, LoginFactory,
              FilesFactory, $state) {

            $rootScope.titlePage = 'Course - ' + $stateParams.code;

            $scope.$state = $state; // for the active class
            $scope.update = false;
            $scope.editing = false;
            $scope.errorPostHomepage = false;

            // If stateParams changed, update course
            if ($scope.course && $stateParams.code !== $scope.course.code) {
                $scope.update = true;
            }

            if (!$scope.course || $scope.update) {

                CoursesFactory.loadSpecific($stateParams.code)
                    .then(function (course) {

                        if (course) {
                            $scope.course = course;
                            $scope.update = false;

                            // TODO - Load just on root.course.main
                            CoursesFactory.getHomepage(course.code).then(function (readme) {

                                $scope.course.description = readme || '*This page is empty*';
                            })
                            .catch(function (error) {

                                if (error.status === 404) {
                                    $scope.course.description = '*This page is empty*';
                                }
                                else {
                                    console.log(error);
                                }
                            });
                        }
                        else {
                            $state.go('root.home');
                        }
                    })
                    .catch(function (error) {

                        $state.go('root.home');
                    });
            };


            // Function to fix redirection with ui-sref and $scope.course.code
            // being undefined
            $scope.goToTab = function(state, stateParams) {

                if ($scope.course && $scope.course.code) {
                    $state.go(state, stateParams);
                }
            };

            $scope.editHomepage = function() {
                $scope.editing = true;
            };


            $scope.saveEdit = function(content) {

                CoursesFactory.saveHomepage($scope.course.code, content).then(function(res) {

                    $scope.course.description = content;
                    $scope.editing = false;
                    $scope.errorPostHomepage = false;
                }).catch(function() {

                    $scope.editing = true;
                    $scope.errorPostHomepage = true;
                });
            };

            $scope.cancelEdit = function() {
                $scope.editing = false;
                $scope.errorPostHomepage = false;
            };


    }]);
