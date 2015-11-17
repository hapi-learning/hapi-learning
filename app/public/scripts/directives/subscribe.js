angular.module('hapi-learning')
    .directive('subscribe', ['$stateParams', 'CoursesFactory', function ($stateParams, CoursesFactory) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/directives/subscribe.html',
            link: function (scope, elem, attrs) {
                scope.subscribed = false;
                scope.available = false;
                
                scope.subscribe = function () {
                    CoursesFactory.subscribe($stateParams.code)
                    .then(function(course) {
                        scope.subscribed = true;
                    })
                    .catch(function (error) {console.log(error);});
                };
    
                scope.unsubscribe = function () {
                    CoursesFactory.unsubscribe($stateParams.code)
                    .then(function(course) {
                        scope.subscribed = false;
                    })
                    .catch(function (error) {console.log(error);});
                };
                
                
                CoursesFactory.getSubscribed()
                .then(function(courses) {
                    scope.subscribed = _.find(courses, 'code', $stateParams.code);
                    scope.available = true;
                })
                .catch(function (error) {console.log(error);});
            }
        };
    }]);
