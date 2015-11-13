'use strict';

angular.module('hapi-learning').factory('ConnexionFactory', function () {

    var exports = {};

    exports.connect = function (user) {
        console.log(user.name + ' is online');
        return true; // TO-DO
    };

    exports.disconnect = function (user) {
        console.log(user.name + ' is offline');
        return false; // TO-DO
    };

    return exports;
});
