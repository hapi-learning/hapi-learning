'use strict';

angular.module('hapi-learning')
    .directive('navbar', ['LoginFactory', '$rootScope', '$mdMedia',
                function(LoginFactory, $rootScope, $mdMedia) {
    return {
        restrict: 'E',
        templateUrl: 'templates/navbar.html',
        link: function(scope, elem, attrs) {

            scope.profile = null;
            scope.collapsed = false;
            scope.collapsing = false;

            scope.logout = function() {
                LoginFactory.logout();
            };

            scope.profile = $rootScope.$user;

            scope.collapse = function(collapse) {

                if (scope.collapsing) {
                    return;
                }

                var w = collapse ? '50px' : '175px';

                if (collapse) {
                    scope.collapsed = !scope.collapsed;
                }

                scope.collapsing = true;
                elem.find('.md-sidenav-left').animate({ width: w }, 300, function() {
                    if (!collapse) {
                        scope.collapsed = !scope.collapsed;
                    }

                    scope.collapsing = false;
                    scope.$apply();
                });
            };
        }
    };
}]);
