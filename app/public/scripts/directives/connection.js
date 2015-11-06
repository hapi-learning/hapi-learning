angular.module('hapi-learning').directive('connection', function() {
   return {
       restrict : 'E',
       templateUrl : 'partials/connection.html',
       controller : 'connection-controller',
       controllerAs : 'homeCtrl'
   };
});