'use strict';


angular.module('hapi-learning.um')
    .directive('ifGroup', ['$rootScope', 'ngIfDirective', function($rootScope, ngIfDirective) {
        var ngIf = ngIfDirective[0];

        return {
            transclude: ngIf.transclude,
            priority: ngIf.priority - 1,
            terminal: ngIf.terminal,
            restrict: ngIf.restrict,
            link: function(scope, element, attrs) {
                var args = arguments;
                var done = false;
                $rootScope.$watch('user', function(user) {
                    if (user && !done) {
                        var groups = attrs.ifGroup.split(' ');
                        var role = user.Role.name;
                        var initialNgIf = attrs.ngIf;
                        var ifEvaluator;

                        var hasRole = groups.indexOf(role) !== -1;

                        if (initialNgIf) {
                            ifEvaluator = function() {
                                return scope.$eval(initialNgIf) && hasRole;
                            };
                        } else {
                            ifEvaluator = function() {
                                return hasRole;
                            };
                        }

                        attrs.ngIf = ifEvaluator;
                        ngIf.link.apply(ngIf, args);
                        done = true;
                    }
                });
            }
        };
    }]);

  /*  .directive('ifGroup', ['$rootScope',
                function($rootScope) {

    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {

            elem.addClass('ng-hide');

            var groups = attrs['ifGroup'].split(' ');
            $rootScope.$watch('user', function(user) {

                if (user) {
                    var role = user.Role.name;
                    var hasRole = (groups.indexOf(role) !== -1);

                    if (hasRole) {
                        elem.removeClass('ng-hide');
                    } else {
                        elem.addClass('ng-hide');
                    }
                }
            });
        }
    };*/
//}]);
