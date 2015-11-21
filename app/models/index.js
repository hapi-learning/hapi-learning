'use strict';

const Sequelize = require('sequelize');
const Fs        = require('fs');
const Path      = require('path');
const _         = require('lodash');


exports.register = function(server, options, next) {
    let models = {};

    models.sequelize = new Sequelize(
        options.name || null,
        options.username || null,
        options.password || null, {
            host: options.host || null,
            dialect: options.dialect || null,
            storage: options.storage || null,
            logging: options.logging
        }
    );

    const files = Fs.readdirSync(__dirname);

    _.forEach(files, (file) => {
        if (file !== Path.basename(__filename)) {
            const model = Path.basename(file, '.js');

            const name = model.charAt(0).toUpperCase() + model.slice(1);

            models[name] = models.sequelize.import(model);
        }
    });

    void (function setAssociations(m) {

        // A Course has multiple Tags to describe him
        m.Course.belongsToMany(m.Tag, { through: 'course_tags' });

        // A Course can have multiple Users as Titulars
        m.Course.belongsToMany(m.User, { as: 'Teachers',  through: 'course_titulars'});


        m.Course.belongsToMany(m.User, { as: 'Users', through: 'user_courses'});

        // An User can subscribe to many Courses (not in a Folder)
        m.User.belongsToMany(m.Course, { as: 'Courses', through: 'user_courses' });

        // A user has many folders, he can not share them
        m.User.hasMany(m.Folder, {foreignKey : 'userId'});

        // A Folder contains many Courses
        m.Folder.belongsToMany(m.Course, { through: 'user_courses_folders'});
        // A Course can be in many Folders
        m.Course.belongsToMany(m.Folder, { through: 'user_courses_folders'});

        // An User can have multiple Tags (for example 'A12' + 'gestion')
        m.User.belongsToMany(m.Tag, { through: 'user_tags' });

        // A Role can have multiple Permissions
        m.Role.belongsToMany(m.Permission, { through: 'role_permissions' });

        // A User has a Role
        m.User.belongsTo(m.Role);

        // A user can have specifics additional permissions.
        m.User.belongsToMany(m.Permission, { through: 'user_permissions' });

        // A user(TEACHER ONLY) can post many news
        m.User.hasMany(m.News, {foreignKey : 'userId'});
        
        // A news can be related to a course
        m.Course.hasMany(
            m.News, 
            { 
                foreignKey: {
                    name: 'crsId',
                    allowNull: true
                }
            }
        );
        
    })(models);


    server.expose('models', models);

    next();

};

exports.register.attributes = {
    name: 'models',
    version: require('../../package.json').version
};

