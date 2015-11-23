'use strict';

const _ = require('lodash');
const Hoek = require('hoek');

const internals = {};
internals.removeDates = function(sequelizeObject) {
    return _.omit(sequelizeObject.get({plain: true}), 'updated_at', 'created_at', 'deleted_at');
};

internals.removeDatesArray = function(sequelizeObjects) {
    return _.map(sequelizeObjects, (sequelizeObject => internals.removeDates(sequelizeObject)));
};

// result is a sequelize instance
internals.getCourse = function(result) {

    // Attributes to include in teachers
    const teachersInclude = ['id', 'username', 'email',
                             'first_name', 'last_name'];

    return Promise.resolve(
        Promise
        .all([result.getTags({attributes: ['name'], joinTableAttributes: []}),
              result.getTeachers({attributes: teachersInclude, joinTableAttributes: []})])

        .then(values => {
            let course = result.get({plain:true});
            course.tags = _.map(values[0], (t => t.get('name', {plain:true})));
            course.teachers = _.map(values[1], (t => t.get({plain:true})));

            return course;
        })
    );
};

internals.findCourseByCode = function(Course, id) {

    Hoek.assert(Course, 'Model Course required');
    Hoek.assert(id, 'Course code required');

    return Course.findOne({
        where: {
            code: { $eq : id }
        }
    });
};

// result is a sequelize instance
internals.getUser = function(result) {

    return Promise.resolve(

        result.getTags({attributes: ['name'], joinTableAttributes: []})
        .then(tags => {
            const user = result.get({ plain:true });
            user.tags = _.map(tags, (t => t.get('name', { plain:true })));
            return user;
        })
    );
};

internals.findUser = function(User, username)
{
    Hoek.assert(User, 'Model User required');
    Hoek.assert(username, 'username required');

    return User.findOne({
        where: {
            username: username
        },
        attributes: {
            exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
        }
    });
};

module.exports = {
    removeDates: function (result) {
        if (Array.isArray(result)) {
            return internals.removeDatesArray(result);
        } else {
            return internals.removeDates(result);
        }
    },
    getCourse: internals.getCourse,
    findCourseByCode: internals.findCourseByCode,
    getUser: internals.getUser,
    findUser: internals.findUser,
    extractCourse : internals.extractCourse
};
