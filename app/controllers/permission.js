'use strict';

const Joi = require('joi');
const _ = require('lodash');

exports.get = {
    auth: {
        scope: ['admin']
    },
    description: 'Returns a specific permission',

    validate : {
        params : {
            type : Joi.number().integer().required().description('Permission type number')
        }
    },
    handler: function (request, reply) {

        const Permission = this.models.Permission;

        Permission.findOne({
            where : {
                type : request.params.type
            },
            attributes : {
                exclude: ['id', 'deleted_at', 'updated_at', 'created_at']
            }
        })
        .then(result => {
            if (result)
            {
                return reply(result.get({plain : true}));
            }
            else
            {
                return reply.notFound('Cannot find permission :' + request.params.name);
            }
        })
        .catch(err => reply.badImplementation(err));
    }
};

exports.getAll = {
    auth: {
        scope: ['admin']
    },
    description: 'Returns every permissions',

     handler: function (request, reply) {

        const Permission = this.models.Permission;

        Permission.findAll({
            attributes :{
                exclude: ['deleted_at', 'updated_at', 'created_at']
            }
        })
        .then(results => reply(_.map(results, (result => result.get({plain : true})))))
        .catch(err => reply.badImplementation(err));
    }
};
