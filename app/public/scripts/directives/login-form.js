angular.module('hapi-learning')
    .directive('loginForm', ['$location', 'LoginFactory',
                             function($location, LoginFactory) {
    return {
        restrict: 'E',
        templateUrl: 'scripts/directives/login-form.html',
        link: function(scope, elem, attrs) {

            scope.user = {};

            scope.invalidCredentials = false;
            scope.forgotPassword = false;

            scope.login = function() {
            console.log('Logging in ...');
            LoginFactory
                .login(scope.user)
                .then(function() {
                    $location.path('/')
                })
                .catch(function() {
                    scope.invalidCredentials = true;
                });
            };
        }
    };
}]);
