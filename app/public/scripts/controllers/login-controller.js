angular
    .module('hapi-learning')
    .controller('LoginCtrl',  ['$scope', 'ConnexionFactory',
                                           function ($scope, ConnexionFactory) {

        $scope.user = {};
        $scope.connected = false;

        $scope.login = function() {
            $scope.connected = ConnexionFactory.connect($scope.user);
        };

        $scope.logout = function() {
            $scope.connected = ConnexionFactory.disconnect($scope.user);
        };
}]);
