'use strict';

const sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);
const P        = require('bluebird');
const Fs       = P.promisifyAll(require('fs'));
const hogan    = require('hogan.js');

exports.register = function(server, options, next) {

    const MailNotifier = {};
        
    MailNotifier.notifyNews = function(news, user) {
        
        return new P(function(resolve, reject){
            
            sendgrid.send({
                
                to: user.get('email'),
                from: process.env.OFFICIAL_EMAIL_ADDRESS,
                subject: 'News : ' + news.get('subject'),
                html : news.get('content')
            }, 
            function(err) {
                if (err)
                    reject(err);
                else 
                    resolve();
            });
        })  
    }
    
    server.expose('mail-notifier', MailNotifier);
    
    next();
};

exports.register.attributes = {
    
    name: 'mail-notifier',
    version: require('../../package.json').version,
};
