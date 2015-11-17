angular.module('hapi-learning')
    .directive('subscribe', ['$stateParams', 'CoursesFactory', function ($stateParams, CoursesFactory) {
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
                    CoursesFactory.subscribe(attrs.code)
                    .then(function(course) {
                        scope.subscribed = true;
                    })
                    .catch(function (error) {console.log(error);});
                };
    
                scope.unsubscribe = function () {
                    CoursesFactory.unsubscribe(attrs.code)
                    .then(function(course) {
                        scope.subscribed = false;
                    })
                    .catch(function (error) {console.log(error);});
                };
                
                CoursesFactory.getSubscribed()
                .then(function(courses) {
                    console.log(attrs.code);
                    scope.subscribed = _.find(courses, 'code', attrs.code);
                    scope.available = true;
                })
                .catch(function (error) {console.log(error);});
            }
        };
    }]);
