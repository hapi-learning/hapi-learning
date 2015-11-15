'use strict';

angular.module('hapi-learning')
    .factory('AuthStorage', ['store', function (store) {
        return store.getNamespacedStore('auth');
}]);
