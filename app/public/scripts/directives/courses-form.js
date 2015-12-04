angular.module('hapi-learning')
    .directive('coursesForm', ['CoursesFactory', function(CoursesFactory) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/directives/courses-form.html',
			link: function (scope, elem, attrs) {
				
				scope.course = {
					name: null,
					code: null,
                    homepage: null,
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
