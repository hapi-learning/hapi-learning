angular.module('hapi-learning')
    .factory('ProfileFactory', ['$http', 'Restangular', '$q', function($http, Restangular, $q) {

        var exports = {};

        exports.update = function(profile) {

            return $http({
                method: 'PATCH',
                url: Restangular.configuration.baseUrl + '/me',
                data: JSON.stringify(profile)
            });
        };

        return exports;
    }]);
