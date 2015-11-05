'use strict';

angular.module('hapi-learning').factory('connexion_factory', function () {
    
    var connexion_factory = {}; 
    
    connexion_factory.connect = function (user) {
        console.log(user.name + ' is online');
        return true; // TO-DO
    };
    
    connexion_factory.disconnect = function (user) {
        console.log(user.name + ' is offline');
        return false; // TO-DO
    };

    return connexion_factory;
});
