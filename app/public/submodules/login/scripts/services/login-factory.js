'use strict';

angular.module('hapi-learning.login')
    .factory('LoginFactory', ['$state', '$http', 'jwtHelper',
                              'AuthStorage', '$q', 'CONFIG',
                              function ($state, $http, jwtHelper,
                                         AuthStorage, $q, CONFIG) {

    var exports = {};
    var internals = {};

    internals.loadProfile = function() {
        return $q(function(resolve, reject) {
            $http({
                url: CONFIG.API_PREFIX + CONFIG.API_ME_ENDPOINT,
                method: 'GET',
            })
            .$promise
            .then(function success(response) {
                var user = response.data;
                resolve(user);
            })
            .catch(function failure(error) {
                reject(error);
            });
        });

    };
    exports.getToken = function() {
        return AuthStorage.get('token');
    };

    exports.isConnected = function() {
        return exports.getToken() !== null;
    };

    exports.getProfile = function() {
        return $q(function(resolve, reject) {
            if (!internals.profile) {
                internals.loadProfile().then(function(profile) {
                    internals.profile = profile;
                    resolve(internals.profile);
                });
            } else {
                resolve(internals.profile);
            }
        });
    };

    exports.login = function (user) {

        return $q(function(resolve, reject) {
            $http({
                url: CONFIG.API_PREFIX + CONFIG.API_LOGIN_ENDPOINT,
                skipAuthorization: true,
                method: 'POST',
                data: {
                    username: user.name, // TODO
                    password: user.password
                }
            })
            .$promise
            .then(function(response) {
                internals.loadProfile().then(resolve).catch(reject);
            })
            .catch(function(error) {
                reject(error);
            });
        });
    };

    exports.logout = function () {
        return $q(function(resolve, reject) {

            $http({
                url: CONFIG.API_PREFIX +  CONFIG.API_LOGOUT_ENDPOINT,
                method: 'POST'
            })
            .$promise
            .then(function (response) {
                AuthStorage.remove('token');
                delete internals.profile;
                $state.go(CONFIG.LOGIN_STATE);
                resolve();
            }).catch(function (response) {
                reject(response);
            });
        });
    };

    return exports;
}]);
