'use strict';

const sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);
const P        = require('bluebird');
const Fs       = P.promisifyAll(require('fs'));
const hogan    = require('hogan.js');

exports.register = function(server, options, next) {

    const MailNotifier = {};
        
    MailNotifier.notifyNews = function(news, mailAddress) {
        
        sendgrid.send({
            to: mailAddress,
            from: process.env.OFFICIAL_EMAIL_ADDRESS,
            subject: 'News :' + news.subject,
            html : news.content
        })   
    }
    
    server.expose('mail-notifier', MailNotifier);
    
    next();
};

exports.register.attributes = {
    
    name: 'mail-notifier',
    version: require('../../package.json').version,
};