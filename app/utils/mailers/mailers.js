'use strict';

const sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);
const P        = require('bluebird');
const Path     = require('path');
const Fs       = require('fs');
const hogan    = require('hogan.js');

const newsTemplate = Fs.readFileSync(Path.join(__dirname, 'mail-templates/news.hjs'), 'utf-8');
const forgotTemplate = Fs.readFileSync(Path.join(__dirname, 'mail-templates/forgot.hjs'), 'utf-8');
const compiledNewsTemplate = hogan.compile(newsTemplate);
const compiledForgotTemplate = hogan.compile(forgotTemplate);


const internals = {
    sendgrid: function(options) {
        return new P(function(resolve, reject) {
            sendgrid.send(options, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};

exports.register = function(server, options, next) {

    const Mailers = {};

    Mailers.notifyNews = function(news, user) {
        return internals.sendgrid({
            to: user.get('email'),
            from: process.env.OFFICIAL_EMAIL_ADDRESS,
            subject: 'News : ' + news.subject,
            html : compiledNewsTemplate.render(news)
        });
    };

    Mailers.sendPasswordReset = function(user, link) {

        const data = {
            username: user.get('username'),
            resetlink: link
        };

        return internals.sendgrid({
            to: user.get('email'),
            from: process.env.OFFICIAL_EMAIL_ADDRESS,
            subject: 'Forgot password',
            html: compiledForgotTemplate.render(data)
        });
    };

    server.app.mailers = Mailers;

    next();
};

exports.register.attributes = {
    name: 'mailers',
    version: require('../../../package.json').version,
};
