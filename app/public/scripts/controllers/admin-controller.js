'use strict';

angular.module('hapi-learning')
    .controller('AdminCtrl', ['$scope', 'TeachersFactory', function ($scope, TeachersFactory) {

        $scope.user = {};
        $scope.usersFileNotValid = false;
        $scope.usersFileContent = null;

        $scope.removeNotValidError = function() {
            $scope.usersFileNotValid = false;
        };

        $scope.cancelUploadUsers = function() {
            $scope.removeNotValidError();
            $scope.usersFileContent = null;
        };

        $scope.uploadUsers = function() {

        };

        $scope.showUsersFileContent = function(content) {
            try {
                $scope.usersFileContent = JSON.parse(content);
                $scope.usersFileNotValid = false;
            } catch(err) {
                $scope.usersFileNotValid = true;
            }
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
