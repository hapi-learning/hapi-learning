angular.module('hapi-learning')
    .directive('h2Small', [function () {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'scripts/directives/h2-small.html'
        };
    }]);

