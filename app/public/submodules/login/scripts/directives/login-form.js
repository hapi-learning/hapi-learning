angular.module('hapi-learning.login')
    .directive('loginForm', ['$state', '$stateParams', 'LoginFactory', 'CONFIG',
                             function($state, $stateParams, LoginFactory, CONFIG) {
    return {
        restrict: 'A',
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
                        $state.go(CONFIG.AFTER_LOGIN_STATE);
                    })
                    .catch(function() {
                        scope.invalidCredentials = true;
                    });
                };
        }
    };
}]);
