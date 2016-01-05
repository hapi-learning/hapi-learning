'use strict';

angular.module('hapi-learning')
    .directive('navbar', ['LoginFactory', '$rootScope', '$mdMedia',
                function(LoginFactory, $rootScope, $mdMedia) {
    return {
        restrict: 'E',
        templateUrl: 'components/navbar/navbar.html',
        link: function(scope, elem, attrs) {


            scope.profile = $rootScope.$user;
            scope.tooltipDirection = 'right';
            scope.isLockedOpen = true;
            scope.collapsed = false;
            scope.collapsing = false;
            scope.collapsedW = '50px';
            scope.uncollapsedW = '200px';

            scope.avatarWBig = '75px';
            scope.avatarWSmall = '45px';


            var sidenav = elem.find('.md-sidenav-left');
            var avatar = elem.find('#avatar');

            avatar.css({ width: '0px' });
            sidenav.css({ width: '0px' });


            scope.logout = function() {
                LoginFactory.logout();
            };


            scope.collapse = function(collapse) {

                if (scope.collapsing) {
                    return;
                }

                var w = collapse ? scope.collapsedW : scope.uncollapsedW;

                if (collapse) {
                    scope.collapsed = !scope.collapsed;
                }

                var avatarW = collapse ? scope.avatarWSmall : scope.avatarWBig;

                scope.collapsing = true;
                avatar.animate({ width: avatarW, height: avatarW }, 300);
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
                avatar.css({ width: scope.avatarWSmall, height: scope.avatarWSmall });
                scope.collapsed = true;
            } else {
                sidenav.css({ width: scope.uncollapsedW });
                avatar.css({ width: scope.avatarWBig, height: scope.avatarWBig });
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
