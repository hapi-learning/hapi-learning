angular.module('hapi-learning')
    .controller('CourseCtrl', ['$scope', '$stateParams', 'CoursesFactory', 'LoginFactory',
                function ($scope, $stateParams, CoursesFactory, LoginFactory) {

            $scope.course = {};
            $scope.subscribed = function () {
                const courses = CoursesFactory.getSubscribedCourses();
                
                    console.log(courses);
                
                return false;
            };
            $scole.subscribe = function () {
                CoursesFactory.subscribe($stateParams.code)
                .then(function(course) {})
                .catch(function(error) {
                    console.log(error);
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