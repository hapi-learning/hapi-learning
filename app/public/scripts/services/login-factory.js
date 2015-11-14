'use strict';

angular.module('hapi-learning')
    .factory('LoginFactory', ['$location', '$http', 'API', 'AuthStorage',
                              function ($location, $http, API, AuthStorage) {

    var exports = {};
    var internals = {};


    internals.profile = null;

    exports.getToken = function() {
        return AuthStorage.get('token');
    };

    exports.getProfile = function() {
        return internals.profile;
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
                AuthStorage.set('token', response.token);

                //TODO ASSIGN CURRENT USER

                resolve();
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
