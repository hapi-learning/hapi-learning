'use strict';

angular.module('hapi-learning')
    .controller('AdminCtrl', [
        '$scope',
        'TeachersFactory',
        'UsersFactory',
        'TagsFactory', function ($scope, TeachersFactory, UsersFactory, TagsFactory) {

        $scope.user = {};
        $scope.usersFileNotValid = false;
        $scope.usersFileContent = null;
        $scope.countAddedUsers = null;
        $scope.schemaNotValid = false;
        $scope.conflicts = false;

        $scope.removeNotValidError = function() {
            $scope.usersFileNotValid = false;
            $scope.schemaNotValid = false;
            $scope.conflicts = false;
        };

        $scope.resetUploadUsers = function() {
            $scope.removeNotValidError();
            $scope.usersFileContent = null;
        };

        $scope.removeCountAddedUsers = function() {
            $scope.countAddedUsers = null;
        };

        $scope.uploadUsers = function() {
            if ($scope.usersFileContent) {
                UsersFactory
                    .create($scope.usersFileContent)
                    .then(function(res) {
                        $scope.countAddedUsers = res.count;
                        $scope.resetUploadUsers();
                    })
                    .catch(function(err) {
                        if (err.status === 400) {
                            $scope.schemaNotValid = true;
                        } else if (err.status === 409) {
                            $scope.conflicts = true;
                        }
                    });
            }
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

        $scope.createTags = function() {
            _.forEach($scope.tags, function(tag) {
                var t = { name: tag.text };
                TagsFactory.create(t)
                    .then(function() {

                    })
                    .catch(function() {

                    });
            });

        };
    }]);
