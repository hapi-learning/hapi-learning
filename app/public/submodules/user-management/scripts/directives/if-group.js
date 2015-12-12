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
                var initialNgIf = attrs.ngIf;
                var ifEvaluator;
                var user = $rootScope.$user;

                if (user) {
                    var groups = attrs.ifGroup.split(' ');
                    var role = user.Role.name;
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
                } else {
                    ifEvaluator = function() {
                        return false;
                    };
                }

                attrs.ngIf = ifEvaluator;
                ngIf.link.apply(ngIf, args);
            }
        };
    }]);
