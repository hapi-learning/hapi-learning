angular.module('hapi-learning')
    .directive('lastNews', function() {
   return {
       restrict: 'E',
       templateUrl: 'scripts/directives/last-news.html'
   };
});
