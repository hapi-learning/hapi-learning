'use strict';

angular.module('hapi-learning').directive('searchCourses', function() {
   return {
       restrict : 'E',
       templateUrl: 'components/search-courses/search-courses.html'
   };
});
