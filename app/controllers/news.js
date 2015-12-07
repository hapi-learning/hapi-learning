'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
const P = require('bluebird');

const Utils = require('../utils/sequelize');

const internals = {};

exports.getAll = {
    description: 'Returns every news',
    handler: function (request, reply) {

        const News = this.models.News;

        News.findAll({
                order: 'date DESC'
            })
            .then(news => reply(Utils.removeDates(news)))
            .catch(error => reply.badImplementation(error));
    }
};

exports.get = {
    description: 'Returns a specific news',
    validate: {
        params: {
            id: Joi.number().integer().required().description('News id')
        }
    },
    handler: function (request, reply) {

        const News = this.models.News;

        News.findOne({
                where: {
                    id: request.params.id
                }
            })
            .then(news => {
                if (news) {
                    return reply(Utils.removeDates(news));
                }
                else {
                    return reply.notFound('News ' + request.params.id + ' not found');
                }
            })
            .catch(error => reply.badImplementation(error));
    }
};

exports.post = {
    description: 'Create a news',
    validate: {
        payload: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            code: Joi.string().min(1).max(255).description('Course related code'),
            subject: Joi.string().min(1).max(255).required().description('Subject news'),
            content: Joi.string().required().description('News content'),
            priority : Joi.string().valid('info', 'warning', 'danger').description('News priority')
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;
        const Course = this.models.Course;
        const News = this.models.News;

        const username = request.payload.username;
        const code = request.payload.code;
        const subject = request.payload.subject;
        const content = request.payload.content;
        const priority = request.payload.priority;

        Utils.findUser(User, username)
            .then(user => {
                if (user) {
                    if (code) {
                        Utils.findCourseByCode(Course, code)
                            .then(course => {
                                if (course) {
                                    News.create({
                                            subject: subject,
                                            content: content,
                                            user: username,
                                            course: code,
                                            priority: priority
                                        })
                                        .then(news => reply(Utils.removeDates(news)).code(201))
                                        .catch((error) => reply.conflict(error));
                                }
                                else {
                                    return reply.badData('Invalid course');
                                }
                            })
                            .catch((error) => reply.conflict(error));
                    }
                    else {
                        News.create({
                                subject: subject,
                                content: content,
                                user: username
                            })
                            .then(news => reply(Utils.removeDates(news)).code(201))
                            .catch((error) => reply.conflict(error));
                    }
                }
                else {
                    return reply.badData('Invalid user');
                }
            })
            .catch(error => reply.badImplementation(error));
    }
};
