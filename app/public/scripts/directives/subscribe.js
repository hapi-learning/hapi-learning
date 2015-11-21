'use strict';

angular.module('hapi-learning')
    .directive('subscribe', ['CoursesFactory', function (CoursesFactory) {
        return {
            restrict: 'E',
            scope : {
                code : '='
            },
            templateUrl: 'scripts/directives/subscribe.html',
            link: function (scope, elem, attrs) {
                
                scope.subscribed = false;
                scope.available = false;
                
                scope.subscribe = function () {
                    CoursesFactory.subscribe(scope.code)
                    .then(function(course) {

                        scope.subscribed = true;

                    })
                    .catch(function (error) {console.log(error);});
                };

                scope.unsubscribe = function () {
                    CoursesFactory.unsubscribe(scope.code)
                    .then(function(course) {
                        scope.subscribed = false;
                    })
                    .catch(function (error) {console.log(error);});
                };

                scope.$watch('code', function(value) {
                    if (value) {
                        CoursesFactory.getSubscribed()
                        .then(function(courses) {

                            scope.subscribed = _.find(courses, 'code', value) ? true : false;
                            scope.available = true;
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    }
                });

            }
        };
    }]);
