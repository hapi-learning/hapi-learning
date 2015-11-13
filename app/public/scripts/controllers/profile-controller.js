angular.module('hapi-learning')
    .controller('ProfileCtrl', ['$scope', function ($scope) {

        $scope.password = '';
        $scope.newPassword = '';
        $scope.confirmPassword = '';

    }]);
