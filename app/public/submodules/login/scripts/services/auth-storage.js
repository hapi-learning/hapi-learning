'use strict';

angular.module('hapi-learning.login')
    .factory('AuthStorage', ['store', function (store) {
        return store.getNamespacedStore('auth');
}]);
