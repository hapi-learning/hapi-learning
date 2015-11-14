'use strict';

angular.module('hapi-learning')
    .factory('LoginFactory', ['$http', 'API', 'store', function ($http, API, store) {

    var exports = {};
    var internals = {};


    internals.currentUser = null;

    exports.getToken = function() {
        return store.get('token');
    };

    exports.getCurrentUser = function() {
        return internals.currentUser;
    };

    exports.login = function (user) {


        $http({
            url: API + '/login',
            skipAuthorization: true,
            method: 'POST',
            data: {
                username: user.name, // TODO
                password: user.psasword
            }
        }).then(function success(response) {
            store.set('token', response.token);
        }, function failure(response) {

        });
    };

    exports.logout = function (user) {

        $http({
            url: API + '/logout',
            method: 'POST'
        }).then(function success(response) {

        }, function failure(response) {

        });
    };

    return exports;
}]);
