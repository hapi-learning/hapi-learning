angular.module('hapi-learning')
    .directive('teacherInfo', function() {
   return {
       restrict: 'EAC',
       templateUrl: 'scripts/directives/teacher-info.html'
   };
});