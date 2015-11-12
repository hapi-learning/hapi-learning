angular.module('hapi-learning')
    .controller('profile-controller', ['$scope', function ($scope, courses_factory) {

        $scope.password = '';
        $scope.newPassword = '';
        $scope.confirmPassword = '';

    }]);