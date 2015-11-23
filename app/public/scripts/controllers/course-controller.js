'use strict';

angular.module('hapi-learning')
    .controller('CourseCtrl', [
        '$rootScope', '$scope', '$stateParams',
        'CoursesFactory', 'LoginFactory',
        'FilesFactory', '$state',

    function ($rootScope, $scope, $stateParams,
              CoursesFactory, LoginFactory,
              FilesFactory, $state) {

        $scope.update = false;
        $scope.course = null;
        $scope.editing = false;


        // If stateParams changed, update course
        if ($scope.course && $stateParams.code !== $scope.course.code) {
            $scope.update = true;
        }

        if (!$scope.course || $scope.update) {

            CoursesFactory.loadSpecific($stateParams.code)
            .then(function (course) {
                if (course) {
                    $scope.course = course;
                    $scope.course.description = course.description || 'This page is empty';
                } else {
                    $state.go('root.home');
                }
            })
            .catch(function (error) {
                $state.go('root.home');
            });
        };
    }]);
