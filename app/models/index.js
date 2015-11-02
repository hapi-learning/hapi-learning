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

        // A course has a category
        _.Course.belongsToMany(_.Tag, { through: 'course_tags' });

        // A user has many courses (not in a folder)
        _.Course.belongsToMany(_.User, { through: 'user_courses' });

        // A user has many course folders
        _.CourseFolder.belongsToMany(_.User, { through: 'user_folders'});

        // A Course folders has many courses
        _.Course.belongsToMany(_.CourseFolder, { through: 'user_courses_folders'})


    })(models);


    server.expose('models', models);

    next();

};

exports.register.attributes = {
    name: 'models',
    version: require('../../package.json').version
}

