const Catbox = require('catbox');


exports.register = function(server, options, next) {

    options = options || {};

    const client = new Catbox.Client(require('catbox-memory'), options);
    server.expose('cache', client);
    next();
};


exports.register.attributes = {
    name: 'cache',
    version: require('../../package.json').version
}
