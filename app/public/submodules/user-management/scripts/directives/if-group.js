'use strict';


angular.module('hapi-learning.um')
    .directive('ifGroup', ['$rootScope',
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
    };
}]);
