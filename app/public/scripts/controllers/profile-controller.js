angular.module('hapi-learning')
    .controller('profile-controller', ['$scope', function ($scope) {

        $scope.password = '';
        $scope.newPassword = '';
        $scope.confirmPassword = '';

    }]);
