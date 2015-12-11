'use strict';

const Hoek = require('hoek');
const Joi  = require('joi');
const P    = require('bluebird');
const _    = require('lodash');

const Utils        = require('../utils/sequelize');

const internals = {};


/**
 * @api {get} /news Get all news
 * @apiName GetManyNews
 * @apiGroup News
 * @apiVersion 1.0.0
 *
 * @apiPermission all users.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An array of news ordered by descendant date.
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
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

/**
 * @api {get} /news/:id Get a news
 * @apiName GetOneNews
 * @apiGroup News
 * @apiVersion 1.0.0
 *
 * @apiPermission all users.
 *
 * @apiParam {Number} id The news id.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The news.
 *
 * @apiError {json} 404 News not found.
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
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

/**
 * @api {post} /news Post a news
 * @apiName PostNews
 * @apiGroup News
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 201 The created news.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 *
 */
exports.post = {
    description: 'Create a news',
    auth: {
        scope: ['admin', 'teacher']
    },
    validate: {
        payload: {
            username: Joi.string().min(1).max(30).required().description('User personal ID'),
            code: Joi.string().min(1).max(255).allow(null).description('Course related code'),
            subject: Joi.string().min(1).max(255).required().description('Subject news'),
            content: Joi.string().required().description('News content'),
            priority : Joi.string().valid('info', 'warning', 'danger').description('News priority')
        }
    },
    handler: function (request, reply) {

        const User = this.models.User;
        const Course = this.models.Course;
        const News = this.models.News;
        const MailNotifier = request.server.plugins['mail-notifier']['mail-notifier'];

        const username = request.payload.username;
        const code = request.payload.code;
        const subject = request.payload.subject;
        const content = request.payload.content;
        const priority = request.payload.priority;

        const tail = request.tail('mails-notification');

        Utils.findUser(User, username).then(user => {
            if (user) {
                const news = {
                    subject: subject,
                    content: content,
                    user: username,
                    priority: priority
                };

                if (code) {
                    Utils.findCourseByCode(Course, code).then(course => {
                        if (course) {

                            news.course = code;

                            course.getUsers().then(users => {
                                const promises = _.map(users, user => {
                                    if (user.get('notify'))
                                        return MailNotifier.notifyNews(news, user);
                                    else
                                        return P.resolve();
                                });

                                P.all(promises).then(tail);
                            });

                            News.create(news)
                                .then(news => reply(Utils.removeDates(news)).code(201))
                                .catch((error) => reply.conflict(error));

                        }
                        else {
                            return reply.badData('Invalid course');
                        }
                    })
                    .catch((error) => reply.conflict(error));
                } else {

                    User.findAll().then(users => {
                        const promises = _.map(users, user => {
                            if (user.get('notify'))
                                return MailNotifier.notifyNews(news, user);
                            else
                                return P.resolve();
                        });

                        P.all(promises).then(tail);
                    });

                    News.create(news)
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
