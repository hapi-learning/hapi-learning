angular.module('hapi-learning')
    .directive('usersForm', function() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/directives/users-form.html'

        };
    });
