'use strict';

const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');

exports.get = {
    description: 'Returns a specific permission',
    auth : false,
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
                return reply(Boom.notFound('Can not find permission :' + request.params.name));
            }
        })
        .catch(error => reply(Boom.badImplementation('An internal server error occurred : ' + error)));
    }
};

exports.getAll = {
    description: 'Returns every permissions',
    auth : false,
     handler: function (request, reply) {
                
        const Permission = this.models.Permission;

        Permission.findAll({
            attributes :{
                exclude: ['deleted_at', 'updated_at', 'created_at']
            }
        })
        .then(results => reply(_.map(results, (result => result.get({plain : true})))))
        .catch(error => reply(Boom.badImplementation('An internal server error occurred : ' + error)));
    }
};
