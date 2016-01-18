'use strict';

const Sequelize = require('sequelize');
const Fs        = require('fs');
const Path      = require('path');
const _         = require('lodash');


exports.register = function (server, options, next) {

    const models = {};

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
            const name = _.upperFirst(_.camelCase(model));
            models[name] = models.sequelize.import(model);
        }
    });

    void (function setAssociations(m) {

        m.User.hasMany(m.PasswordResetRequest);

        // A Course has multiple Tags to describe him
        m.Course.belongsToMany(m.Tag, { through: 'course_tags' });

        // A Course can have multiple Users as Titulars
        m.Course.belongsToMany(m.User, { as: 'Teachers',  through: 'course_titulars' });


        m.Course.belongsToMany(m.User, { as: 'Users', through: 'user_courses' });

        // An User can subscribe to many Courses (not in a Folder)
        m.User.belongsToMany(m.Course, { as: 'Courses', through: 'user_courses' });

        // A user has many folders, he can not share them
        m.User.hasMany(m.Folder, { foreignKey: 'userId' });

        // A Folder contains many Courses
        m.Folder.belongsToMany(m.Course, { through: 'user_courses_folders' });
        // A Course can be in many Folders
        m.Course.belongsToMany(m.Folder, { through: 'user_courses_folders' });

        // An User can have multiple Tags (for example 'A12' + 'gestion')
        m.User.belongsToMany(m.Tag, { through: 'user_tags' });

        // A Role can have multiple Permissions
        m.Role.belongsToMany(m.Permission, { through: 'role_permissions' });

        // A User has a Role
        m.User.belongsTo(m.Role);

        // A user can have specifics additional permissions.
        m.User.belongsToMany(m.Permission, { through: 'user_permissions' });


        m.News.belongsTo(m.User, {
            foreignKey : {
                name : 'user',
                allowNull : false
            },
            targetKey : 'username'
        });

        // A news can be related to a course
        m.News.belongsTo(m.Course, {
            foreignKey : {
                name : 'course',
                allowNull : true
            },
            targetKey : 'code'
        });


    })(models);


    server.app.models = models;

    server.ext('onPreStart', (s, n) => {

        const Models = s.app.models;

        Models.sequelize.sync({
            force: options.flush,
            logging: options.logging ? console.log : false
        }).finally(n);
    });


    next();

};

exports.register.attributes = {
    name: 'models',
    version: require('../../package.json').version
};

