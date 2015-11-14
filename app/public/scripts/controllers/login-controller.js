angular
    .module('hapi-learning')
    .controller('LoginCtrl',  ['$scope', 'LoginFactory',
                                           function ($scope, LoginFactory) {

        $scope.user = {};
        $scope.connected = false;

        $scope.login = function() {
            $scope.connected = LoginFactory.login($scope.user);
        };

        $scope.logout = function() {
            $scope.connected = LoginFactory.logout($scope.user);
        };
}]);
