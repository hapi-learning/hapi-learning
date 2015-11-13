'use strict';

angular.module('hapi-learning').factory('ConnexionFactory', function () {

    var connection_factory = {};

    connection_factory.connect = function (user) {
        console.log(user.name + ' is online');
        return true; // TO-DO
    };

    connection_factory.disconnect = function (user) {
        console.log(user.name + ' is offline');
        return false; // TO-DO
    };

    return connection_factory;
});
