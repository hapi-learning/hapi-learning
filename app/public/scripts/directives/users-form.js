angular.module('hapi-learning')
    .directive('usersForm', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/users-form.html'

        };
    });
