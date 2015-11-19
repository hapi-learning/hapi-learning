'use strict';

angular.module('hapi-learning')
    .factory('LoginFactory', ['$location', '$http', 'jwtHelper',
                              'AuthStorage', 'Restangular',
                              function ($location, $http, jwtHelper,
                                         AuthStorage, Restangular) {

    var exports = {};
    var internals = {};



    internals.profile = {};

    exports.getToken = function() {
        return AuthStorage.get('token');
    };

    exports.getProfile = function() {
        return AuthStorage.get('profile');
    };

    exports.login = function (user) {

        return new Promise(function(resolve, reject) {
            $http({
                url: Restangular.configuration.baseUrl + '/login',
                skipAuthorization: true,
                method: 'POST',
                data: {
                    username: user.name, // TODO
                    password: user.password
                }
            }).then(function success(response) {
                AuthStorage.set('token', response.data.token);

                var username = jwtHelper.decodeToken(response.data.token).username;

                $http({
                    url: Restangular.configuration.baseUrl + '/me',
                    method: 'GET',
                }).then(function success(response) {
                    var user = response.data;
                    internals.profile.id = user.id;
                    internals.profile.username = user.username;
                    internals.profile.email = user.email;
                    internals.profile.firstName = user.firstName;
                    internals.profile.lastName = user.lastName;
                    internals.profile.phoneNumber = user.phoneNumber;

                    AuthStorage.set('profile', internals.profile);

                    resolve();
                }, function failure(error) {
                    reject(error);
                });
            });
        });
    };

    exports.logout = function () {

        return new Promise(function(resolve, reject) {

            $http({
                url: Restangular.configuration.baseUrl + '/logout',
                method: 'POST'
            }).then(function success(response) {
                AuthStorage.remove('token');
                AuthStorage.remove('profile');
                $location.path('/login');
                resolve();
            }, function failure(response) {
                reject(response);
            });

        });

    };

    return exports;
}]);
