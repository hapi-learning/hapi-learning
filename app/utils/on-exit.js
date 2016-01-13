'use strict';

const Hoek = require('hoek');

const internals = {
    defaults: {
        timeout: 5 * 1000,
        callback: null
    }
};

exports.register = function (server, options, next) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);

    if (typeof settings.timeout !== 'number') {
        return next(new TypeError('timeout must be a number'));
    }

    if (settings.callback && typeof settings.callback !== 'function') {
        return next(new TypeError('callback must be a function'));
    }

    const stop = function () {

        server.root.stop({
            timeout: settings.timeout
        }, () => {});
        //TODO REMOVE CALLBACk
    };

    if (settings.callback) {
        server.ext('onPostStop', settings.callback);
    }

    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);

    next();
};

exports.register.attributes = {
    name: 'on-exit',
    version: '1.0.0'
};
