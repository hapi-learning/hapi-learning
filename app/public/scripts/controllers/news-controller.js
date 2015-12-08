'use strict';

angular
    .module('hapi-learning')
    .controller('NewsCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {
        $rootScope.titlePage = 'News';
    }]);
