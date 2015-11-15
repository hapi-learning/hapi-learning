angular.module('hapi-learning')
    .controller('CourseCtrl', ['$scope', '$stateParams', 'Restangular',
                function ($scope, $stateParams, Restangular) {

            Restangular.one('courses', $stateParams.code)
                .get()
                .then(function (response) {
                    $scope.code = response.code;
                    $scope.name = response.name;
                    $scope.tags = response.tags;
                    $scope.teachers = response.teachers;
                });
    }]);