angular
    .module('hapi-learning')
    .controller('HomeCtrl', ['$scope', 'CoursesFactory',
                             function ($scope, CoursesFactory) {

        $scope.subscribedCourses = [];


        CoursesFactory.getSubscribed().then(function(courses) {
            $scope.subscribedCourses = courses;
            console.log(courses);
        }).catch(function(error) {
            console.log(error);
        });


}]);
