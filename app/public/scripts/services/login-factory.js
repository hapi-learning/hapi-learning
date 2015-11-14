'use strict';

angular.module('hapi-learning')
    .factory('LoginFactory', ['$location', '$http', 'jwtHelper',
                              'API', 'AuthStorage', 'Restangular',
                              function ($location, $http, jwtHelper,
                                         API, AuthStorage, Restangular) {

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
                url: API + '/login',
                skipAuthorization: true,
                method: 'POST',
                data: {
                    username: user.name, // TODO
                    password: user.password
                }
            }).then(function success(response) {
                AuthStorage.set('token', response.data.token);

                var username = jwtHelper.decodeToken(response.data.token).username;

                Restangular.one('users', username)
                    .get()
                    .then(function(response) {
                        internals.profile.id = response.id;
                        internals.profile.username = response.username;
                        internals.profile.email = response.email;
                        internals.profile.firstName = response.firstName;
                        internals.profile.lastName = response.lastName;
                        internals.profile.phoneNumber = response.phoneNumber;

                        AuthStorage.set('profile', internals.profile);

                        resolve();
                    });

            }, function failure(response) {
                reject(response);
            });
        });


    };

    exports.logout = function () {

        return new Promise(function(resolve, reject) {

            $http({
                url: API + '/logout',
                method: 'POST'
            }).then(function success(response) {
                AuthStorage.remove('token');
                $location.path('/login');
                resolve();
            }, function failure(response) {
                reject(response);
            });

        });

    };

    return exports;
}]);
