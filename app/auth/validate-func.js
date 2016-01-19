'use strict';

const P = require('bluebird');

module.exports = function (server) {

    return function (decoded, request, callback) {

        const User = server.app.models.User;
        const Role = server.app.models.Role;
        const authorization = request.headers.authorization || request.query.token;


        new P((resolve, reject) => {

            server.methods.parseAuthorization(authorization, (err, token) => {

                if (err) {
                    return reject(err);
                }

                return resolve(token);
            });
        })
        .then((token) => {

            const invalidated = server.methods.isInvalidated(decoded.username, token);
            return P.all([invalidated, token]);
        })
        .spread((invalidated, token) => {


            if (invalidated) {
                return callback(null, false);
            }

            User.findOne({
                where: {
                    username: decoded.username
                },
                include: [{
                    model: Role
                }]
            })
            .then((result) => {

                if (result && result.Role.name === decoded.role) {
                    return callback(null, true, {
                        user: decoded,
                        token: token,
                        scope: [decoded.role, decoded.username]
                    });
                }

                return callback(null, false);

            });

        })
        .catch((err) => callback(err, false));
    };
};
