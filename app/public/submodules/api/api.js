'use strict';

angular.module('hapi-learning.api', [])
       .factory('API', ['$http', function($http) {
           return $http.get('/api');
       }]);
