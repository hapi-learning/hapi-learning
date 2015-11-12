angular
    .module('hapi-learning')
    .controller('news-controller', ['$scope', function ($scope) {

        $scope.annonces = [
            {
                'course': 'ALG',
                'subject': 'New file added',
                'description': 'Projet.pdf has been added. Instructions will follow.',
                'priority': 'info',
                'createdOn': Date.now()
            },
            {
                'course': 'SYS',
                'subject': 'You\'re screwed',
                'description': 'Your mission, if you accept it, is to fail again',
                'priority': 'warning',
                'createdOn': Date.now()
            },
            {
                'course': 'ADMIN',
                'subject': 'Hapi Learning update',
                'description': 'Don\'t worry it can\'t be worse than now',
                'priority': 'danger',
                'createdOn': Date.now()
            }
        ];

}]);