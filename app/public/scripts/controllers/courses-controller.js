angular.module('hapi-learning')
    .controller('courses-controller', ['$scope', function ($scope) {

        $scope.courses = courses;
        
       $scope.subscribed = function() {
           // did the user already subscribe to the course?
           return false;
       };

    }]);


angular.module('hapi-learning')
    .directive('teacherInfo', function() {
   return {
       restrict: 'EAC',
       template: '<a ng-href="mailto: {{teacher.acronyme | lowercase}}@heb.be">{{teacher.name}} ({{teacher.acronyme}})</a>'
//       templateUrl: '../directives/teacher-info.html'
   };
});


var courses = [
    {
        name: 'Atelier logiciel 3e',
        code: 'ATL',
        description: 'Labo consistant à nous faire aimer le Java. A échoué jusqu’à présent.',
        tags: ['3e', 'labo'],
        teachers: [
            {
                name: 'F. Pluquet',
                acronyme: 'FPL'
            }
            ,
            {
                name: 'F. Servais',
                acronyme: 'SRV'
            }],
    },
    {
        name: 'Algorithmique 2e',
        code: 'ALG',
        description: 'Cours théorique de logique basique.',
        tags: ['2e', 'théorique'],
        teachers: [
        {
                name: 'N. Pettiaux',
                acronyme: 'NPX'
            }
            ,
            {
                name: 'L. Beeckmans',
                acronyme: 'LBC'
            }],
     }
];