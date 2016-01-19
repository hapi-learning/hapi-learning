'use strict';

const Catbox = require('catbox');
const CatboxMemory = require('catbox-memory');

const internals = {};

module.exports = function (options) {

    if (!internals.client) {
        internals.client = new Catbox.Client(CatboxMemory, options || {});
        internals.client.start((err) => {

            if (err) {
                throw err;
            }
        });
    }

    return internals.client;
};


