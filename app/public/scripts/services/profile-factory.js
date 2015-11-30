angular.module('hapi-learning')
    .factory('ProfileFactory', ['$http', 'Restangular', '$q', function($http, Restangular, $q) {

        var exports = {};

        exports.update = function(profile) {

            console.log(profile);
            var d = $q.defer();

            $http({
                method: 'PATCH',
                url: Restangular.configuration.baseUrl + '/me',
                data: JSON.stringify(profile)
            }).then(function success() {
                d.resolve();
            }, function failure(err) {
                d.reject(err);
            });

            return d.promise;
        };

        return exports;
    }]);
