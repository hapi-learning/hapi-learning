angular
    .module('hapi-learning')
    .controller('connection-controller',  ['$scope', 'connection_factory', function ($scope, connection_factory) {

        $scope.user = {};
        $scope.connected = false;
        
        $scope.connect = function() {
            $scope.connected = connection_factory.connect($scope.user);
        };
        
        $scope.disconnect = function() {
            $scope.connected = connection_factory.disconnect($scope.user);
        };
}]);
