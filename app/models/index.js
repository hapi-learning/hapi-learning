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

        // A Course has multiple Tags to describe him
        m.Course.belongsToMany(m.Tag, { through: 'course_tags' });

        // An User can subscribe to many Courses (not in a Folder)
        m.Course.belongsToMany(m.User, { through: 'user_courses' });

        // An User can create many Folders containing Courses
        m.Folder.belongsToMany(m.User, { through: 'user_folders'}); 

        // A Folder contains many Courses
        m.Course.belongsToMany(m.Folder, { through: 'user_courses_folders'});
        
        // An User can have multiple Tags (for example 'A12' + 'gestion')
        m.User.belongsToMany(m.Tag, { through: 'user_tags' }); 

    })(models);


    server.expose('models', models);

    next();

};

exports.register.attributes = {
    name: 'models',
    version: require('../../package.json').version
}

