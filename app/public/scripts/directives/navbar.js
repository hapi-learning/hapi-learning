'use strict';

angular.module('hapi-learning')
    .directive('navbar', ['LoginFactory', function(LoginFactory) {
    return {
        restrict: 'A',
        templateUrl: 'scripts/directives/navbar.html',
        link: function(scope, elem, attrs) {

            scope.profile = null;

            scope.logout = function() {
                LoginFactory.logout();
            };

            LoginFactory.getProfile().then(function(profile) {
                scope.profile = profile;
            });
        }
    };
}]);
