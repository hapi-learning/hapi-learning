angular.module('hapi-learning').directive('connection', function() {
    return {
        restrict: 'E',
        templateUrl: 'partials/connection-form.html',
        controller: 'connection-controller',
        controllerAs: 'homeCtrl'
    };
});