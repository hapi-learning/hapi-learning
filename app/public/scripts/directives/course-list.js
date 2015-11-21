'use strict';

angular.module('hapi-learning')
    .directive('courseList', ['CoursesFactory', function (CoursesFactory) {
        return {
            restrict: 'E',
            scope: {
                subscribed: '='
            },
            templateUrl: 'scripts/directives/course-list.html',
            link: function(scope, elem, attrs) {
                scope.courses = [];
                
                scope.$watch('subscribed', function(value) {
                    
                    if (value)
                    {
                        CoursesFactory.getSubscribed()
                            .then(function(courses) {
                            if (courses)
                            {
                                scope.courses = courses;
                            }
                        })
                        .catch(function(error) {console.log(error);});   
                    }
                    else
                    {
                        CoursesFactory.load()
                            .then(function(courses) {
                            if (courses)
                            {
                                scope.courses = courses;
                            }
                        })
                        .catch(function(error) {console.log(error);});   
                    }
                });
            }
        };
    }]);
