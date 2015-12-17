'use strict';

const sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);
const P        = require('bluebird');
const Path     = require('path');
const Fs       = require('fs');
const hogan    = require('hogan.js');

const newsTemplate         = Fs.readFileSync(Path.join(__dirname, 'mail-templates/news.hjs'), 'utf-8');
const compiledNewsTemplate = hogan.compile(newsTemplate);

exports.register = function(server, options, next) {

    const MailNotifier = {};

    MailNotifier.notifyNews = function(news, user) {

        return new P(function(resolve, reject){

            sendgrid.send({

                to: user.get('email'),
                from: process.env.OFFICIAL_EMAIL_ADDRESS,
                subject: 'News : ' + news.subject,
                html : compiledNewsTemplate.render(news)
            }, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    server.expose('mailers', MailNotifier);

    next();
};

exports.register.attributes = {
    name: 'mailers',
    version: require('../../../package.json').version,
};
