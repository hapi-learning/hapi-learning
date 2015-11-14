angular.module('hapi-learning')
    .directive('navbar', ['LoginFactory', function(LoginFactory) {
    return {
        restrict: 'A',
        templateUrl: 'scripts/directives/navbar.html',
        link: function(scope, elem, attrs) {
            scope.logout = function() {
                LoginFactory.logout();
            }
        }
    };
}]);
