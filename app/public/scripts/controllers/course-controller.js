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
        'Restangular',
        '$http',
    function ($rootScope, $scope, $stateParams, CoursesFactory, LoginFactory,
            FilesFactory, $state, Restangular, $http) {

            $scope.$state = $state; // for the active class

            $scope.update = false;
            $scope.course = null;
            $scope.editing = false;
            $scope.errorPostHomepage = null;



            // If stateParams changed, update course
            if ($scope.course && $stateParams.code !== $scope.course.code) {
                $scope.update = true;
            }

            if (!$scope.course || $scope.update) {

                CoursesFactory.loadSpecific($stateParams.code)
                    .then(function (course) {
                        if (course) {
                            $scope.course = course;
                            Restangular
                                .service('courses')
                                .one(course.code)
                                .one('homepage')
                                .get()
                                .then(function (readme) {
                                    $scope.course.description = readme || '*This page is empty*';
                                })
                                .catch(function (error) {
                                    if (error.status === 404)
                                    {
                                        $scope.course.description = '*This page is empty*';
                                    }
                                    else
                                    {
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

            $scope.editHomepage = function() {
                $scope.editing = true;
            };


            $scope.saveEdit = function(content) {
                Restangular
                    .one('courses', $scope.course.code)
                    .customPOST({
                        content: content
                    },
                    'homepage').then(function(res) {
                        $scope.course.description = content;
                        $scope.editing = false;
                        $scope.errorPostHomepage = null;
                    }).catch(function() {
                        $scope.editing = true;
                        $scope.errorPostHomepage = 'Error saving the homepage';
                    });
            };

            $scope.cancelEdit = function() {
                $scope.editing = false;
                $scope.errorPostHomepage = null;
            };


    }]);
