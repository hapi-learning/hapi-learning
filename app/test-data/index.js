'use strict';

const P = require('bluebird');

const internals = {};

internals.initializeData = function (server, next) {

    const Models = server.plugins.models.models;
    const Wreck = require('wreck');
    const User = Models.User;
    const baseUrl = server.select('api').info.uri;

    //const users = require('../resources/users.json');
    const tags  = require('../resources/tags.json');
    const teachers = require('../resources/all_teachers.json');
    const courses = require('../resources/all_courses.json');
    const news = require('../resources/news.json');

    User.create({
        username: 'admin',
        password: 'admin',
        role_id: 1,
        email: 'admin@admin.com',
        firstName: 'admin',
        lastName: 'admin'
    }).then(() => {

        Wreck.post(baseUrl + '/login', {
            payload: JSON.stringify({
                username: 'admin',
                password: 'admin'
            })
        }, (err, response, payload) => {

            if (err) {
                throw err;
            }

            const token = JSON.parse(payload.toString()).token;

            const post = function (url, p) {

                return new P((resolve, reject) => {

                    Wreck.post(baseUrl + url, {
                        payload: JSON.stringify(p),
                        headers: {
                            Authorization: token
                        }
                    }, (err) => {

                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            };

            const addCourses = function () {

                return P.all(_.map(courses, (course) => post('/courses', course)));
            };

            const addTeachers = function () {

                return P.all(_.map(teachers, (teacher) => post('/users', teacher)));
            };

            const addTags = function () {

                return P.all(_.map(tags, (tag) => post('/tags', tag)));
            };

            const addNews = function () {

                return P.all(_.map(news, (n) => post('/news', n)));
            };

            addTags().then(addTeachers).then(addCourses).then(addNews).then(next);

        });
    }).catch(console.log);
};



internals.onPostStart = function (server, next) {

    const Models = server.plugins.models.models;

    const Role = Models.Role;
    const roles = _.map(require('../resources/roles.json'), (role) => Role.create(role));

    Promise.all(roles).then(() => {

        if (internals.flush) {
            initializeData(server, next);
        }
    });
};

exports.register = function (server, options, next) {

    internals.flush = options.flush;

    if (internals.flush) {
        server.ext('onPostStart', internals.onPostStart);
    }
    else {
        return next();
    }
};

exports.register.attributes = {
    name: 'test-data',
    version: require('../../package.json').version
};
