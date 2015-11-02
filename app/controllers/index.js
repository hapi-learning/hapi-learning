'use strict';

const Fs = require('fs');
const Path = require('path');
const _ = require('lodash');

const load = function (options, callback) {
    options = options || {};
    options.extension = options.extension || '.js';
    let controllers = {};

    const files = Fs.readdirSync(__dirname);

    _.forEach(files, (file) => {
        if (file != Path.basename(__filename)) {
            let key = Path.basename(file, options.extension);
            // If file = controller.js -> key will be Controller
            key = key.charAt(0).toUpperCase() + key.splice(1);

            controllers[key] = require((options.path || __dirname) + '/' + file);
        }
    });

    if (callback) {
        return callback(null, controllers);
    }

    return controllers;
};

exports.register = function (server, options, next) {
    load({}, (err, controllers) => {
        if (err) {
            throw err;
        }

        server.expose('controllers', controllers);

        next();
    });
};

exports.register.attributes = {
    name: 'controllers',
    version: require('../../package.json').version,
    dependencies: 'models'
};
