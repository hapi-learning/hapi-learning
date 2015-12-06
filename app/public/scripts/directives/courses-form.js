'use strict';

angular.module('hapi-learning')
    .directive('coursesForm', ['CoursesFactory', function(CoursesFactory) {
        return {
            restrict: 'E',
            templateUrl: 'templates/courses-form.html',
			link: function (scope, elem, attrs) {
				
				scope.course = {
					name: null,
					code: null,
                    homepage: 'NULL',
					teachers: []
				};
				
				scope.postCourse = function() {
                    console.log('post course');
                    console.log(scope.course);
                    
					return CoursesFactory.add(scope.course)
					.then(function(course) {
						alert('course added!');
					})
					.catch(function(error) {
						console.log(error);
					});
				}
				
			}
        };
    }]);
