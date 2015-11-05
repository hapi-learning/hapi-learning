angular
    .module('hapi-learning')
    .controller('home-controller',  ['$scope', 'connexion_factory', function ($scope, connexion_factory) {

        $scope.user = {};
        $scope.connected = false;
        
        $scope.connect = function() {
            $scope.connected = connexion_factory.connect($scope.user);
        };
        
        $scope.disconnect = function() {
            $scope.connected = connexion_factory.disconnect($scope.user);
        };
}]);
