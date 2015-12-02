'use strict';

angular.module('hapi-learning')
    .controller('AdminCtrl', ['$scope', 'TeachersFactory', function ($scope, TeachersFactory) {

        $scope.user = {};

        $scope.forgot = false;

        $scope.reset = function () {
            $scope.forgot = true;
        };

        $scope.backToLogin = function () {
            $scope.forgot = false;
        };

        $scope.showUsersFileContent = function(content) {
            $scope.usersFileContent = JSON.parse(content);
            $scope.prettyUsers = JSON.stringify($scope.usersFileContent, null, 4);
        };

        $scope.loadTeachers = function ($query) {
            return TeachersFactory.load()
                .then(function (teachers) {

                    return teachers.filter(function (teacher) {

                        var username  = teacher.username.toLowerCase();
                        var firstName = teacher.firstName.toLowerCase();
                        var lastName  = teacher.lastName.toLowerCase();
                        var query     = $query.toLowerCase();

                        return username.indexOf(query) != -1 ||
                            firstName.indexOf(query) != -1 ||
                            lastName.indexOf(query) != -1;
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    }]);
