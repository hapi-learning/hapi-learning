angular.module('hapi-learning')
    .directive('courseInfo', function() {
   return {
       restrict: 'EAC',
       templateUrl: 'scripts/directives/course-info.html'
   };
});