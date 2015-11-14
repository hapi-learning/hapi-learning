angular.module('api-provider', [])
       .factory('API', ['$http', function($http) {
           return $http.get('/api');
       }]);
