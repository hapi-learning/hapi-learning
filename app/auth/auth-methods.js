'use strict';

const Hoek = require('hoek');
const _    = require('lodash');
const P    = require('bluebird');
const Cache = require('../cache')();

const internals = {
    cache: {
        invalid: 'InvalidatedTokens'
    }
};


module.exports.methods = [


    {
        name: 'parseAuthorization',
        method: function (authorization, callback) {

            Hoek.assert(authorization, 'authorization is required');
            return callback(null, authorization.replace(/Bearer/gi, '').replace(/ /g, ''));
        },
        options: {
            cache: {
                expiresIn: 1000 * 60 * 30,
                generateTimeout: false
            }
        }
    },


    {
        name: 'isInvalidated',
        method: function (user, token) {

            return new P((resolve, reject) => {

                Cache.get({
                    segment: internals.cache.invalid,
                    id: user
                }, (err, cached) => {

                    if (err) {
                        return reject(err);
                    }

                    if (!cached) {
                        return resolve(false);
                    }

                    return resolve(_.includes(cached.item, token));
                });
            });
        }

    },


    {
        name: 'invalidateToken',
        method: function (user, token, ttl, callback) {

            Hoek.assert(callback, 'callback required');

            const key = {
                segment: internals.cache.invalid,
                id: user
            };

            Cache.get(key, (err, cached) => {

                if (err) {
                    throw err;
                }

                let tokens = [token];

                if (cached) {
                    tokens = _.concat(tokens, cached.item);
                }

                Cache.set({
                    segment: internals.cache.invalid,
                    id: user
                }, tokens, ttl, callback);
            });

        }
    }
];
