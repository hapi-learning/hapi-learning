'use strict';

angular.module('hapi-learning')
    .directive('navbar', ['LoginFactory', '$rootScope', function(LoginFactory, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'templates/navbar.html',
        link: function(scope, elem, attrs) {

            scope.profile = null;

            scope.logout = function() {
                LoginFactory.logout();
            };

            scope.profile = $rootScope.$user;
        }
    };
}]);
