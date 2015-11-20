'use strict';

angular.module('hapi-learning')
    .controller('AdminCtrl', ['$scope', function ($scope) {

        $scope.user = {};

        $scope.forgot = false;

        $scope.reset = function() {
            $scope.forgot = true;
        };

        $scope.backToLogin = function() {
            $scope.forgot = false;
        };

    }]);
