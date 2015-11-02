'use strict';

const Sequelize = require('sequelize');
const Fs        = require('fs');
const Path      = require('path');
const _         = require('lodash');

exports.register = function(server, options, next) {
    let models = {};

    const sequelize = new Sequelize(
    null,
    null,
    null, {
        dialect: 'sqlite',
        storage: 'database.sqlite'
    });

    models.sequelize = sequelize;

    const files = Fs.readdirSync(__dirname);

    _.forEach(files, (file) => {
        if (file !== Path.basename(__filename)) {
            const model = Path.basename(file, '.js');

            const name = model.charAt(0).toUpperCase() + model.slice(1);

            models[name] = sequelize.import(model);
        }
    });

    (function setAssociations(m) {

    // Associations here...

    })(models);


    server.expose('models', models);

    next();

};

exports.register.attributes = {
    name: 'models',
    version: require('../../package.json').version
}

