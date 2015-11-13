angular
    .module('hapi-learning')
    .controller('LoginCtrl',  ['$scope', 'ConnexionFactory',
                                           function ($scope, ConnexionFactory) {

        $scope.user = {};
        $scope.connected = false;

        $scope.connect = function() {
            $scope.connected = connection_factory.connect($scope.user);
        };

        $scope.disconnect = function() {
            $scope.connected = connection_factory.disconnect($scope.user);
        };
}]);
