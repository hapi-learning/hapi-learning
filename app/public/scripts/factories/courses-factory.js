'use strict';

angular.module('hapi-learning').factory('courses_factory', function () {
    const courses = [
        {
            name: 'Atelier logiciel 3e',
            code: 'ATL',
            description: 'Labo consistant à nous faire aimer le Java. A échoué jusqu’à présent.',
            tags: ['3e', 'labo'],
            teachers: [
                {
                    name: 'F. Pluquet',
                    acronyme: 'FPL'
                },
                {
                    name: 'F. Servais',
                    acronyme: 'SRV'
                }
            ],
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
                },
                {
                    name: 'L. Beeckmans',
                    acronyme: 'LBC'
                }
            ],
        }
    ];
    
    this.getCourses = function () {
        return courses;
    };

    return this;
});
