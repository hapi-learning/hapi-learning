angular.module('hapi-learning')
    .controller('admin-controller', ['$scope', function ($scope) {

        $scope.user = {};
        
        $scope.forgot = false;
        
        $scope.reset = function() {
            $scope.forgot = true;
        };
        
        $scope.backToLogin = function() {
            $scope.forgot = false;
        }

    }]);
