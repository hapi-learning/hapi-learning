angular.module('hapi-learning')
    .directive('loginForm', function() {
    return {
        restrict: 'E',
        templateUrl: 'scripts/directives/login-form.html',
        controller: 'LoginCtrl'
    };
});
