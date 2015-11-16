angular.module('hapi-learning')
    .controller('CourseCtrl', ['$scope', '$stateParams', 'CoursesFactory', 'LoginFactory',
                function ($scope, $stateParams, CoursesFactory, LoginFactory) {

            $scope.course = {};
            $scope.subscribed = false;
                    
            $scope.subscribe = function () {
                CoursesFactory.subscribe($stateParams.code)
                .then(function(course) {
                    $scope.subscribed = true;
                })
                .catch(function(error) {
                    alert('already subscribed');
                });
            };
    
            $scope.unsubscribe = function () {
                CoursesFactory.unsubscribe($stateParams.code)
                .then(function(course) {
                    $scope.subscribed = false;
                })
                .catch(function(error) {
                    alert('Already unsubscribed');
                });
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