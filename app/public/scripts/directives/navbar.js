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

            scope.collapsedW = '50px';
            scope.uncollapsedW = '200px';

            var sidenav = elem.find('.md-sidenav-left');

            sidenav.css({ width: '0px' });


            scope.logout = function() {
                LoginFactory.logout();
            };

            scope.profile = $rootScope.$user;

            scope.collapse = function(collapse) {

                if (scope.collapsing) {
                    return;
                }

                var w = collapse ? scope.collapsedW : scope.uncollapsedW;

                if (collapse) {
                    scope.collapsed = !scope.collapsed;
                }

                scope.collapsing = true;
                sidenav.animate({ width: w }, 300, function() {
                    if (!collapse) {
                        scope.collapsed = !scope.collapsed;
                    }

                    scope.collapsing = false;
                    scope.$apply();
                });
            };

            scope.isSmall = function() {
                return $mdMedia('sm') || $mdMedia('xs');
            };

            if (scope.isSmall()) {
                sidenav.css({ width: scope.collapsedW });
                scope.collapsed = true;
            } else {
                sidenav.css({ width: scope.uncollapsedW });
                scope.collapsed = false;
            }

            scope.$watch(scope.isSmall, function(isSmall) {
                if (isSmall && !scope.collapsed) {
                   scope.collapse(true);
                } else if (!isSmall && scope.collapsed) {
                   scope.collapse(false);
                }
            });
        }
    };
}]);
