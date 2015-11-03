angular.module('hapi-learning')
    .controller('courses-controller', ['$scope', function ($scope) {

        

        $scope.courses = courses;
        $scope.cpt = 2;
    }]);


var courses = [
            {
                name: 'Atelier logiciel 3e',
                code: 'ATL',
                description: 'Labo consistant à nous faire aimer le Java. A échoué jusqu’à présent.',
                tags: ['3e', 'labo']
                },
            {
                name: 'Algorithmique 2e',
                code: 'ALG',
                description: 'Cours théorique de logique basique.',
                tags: ['2e', 'théorique']
                }
            ];