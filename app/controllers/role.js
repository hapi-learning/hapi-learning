'use strict';

const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');

exports.get = {
    description: 'Returns a specific role',
    auth : false,
    validate: {
        params: {
            name: Joi.string().min(1).max(255).required().description('Role name')
        }
    },
    handler: function (request, reply) {
        
        const Role = this.models.Role;
        
        Role.findOne({
            where: {
                name : request.params.name
            },
            attributes :{
                exclude: ['deleted_at', 'updated_at', 'created_at']
            }
        })
        .then(result => {
            if (result)
            {
                return reply(result.get({plain : true}));
            }
            else
            {
                return reply(Boom.notFound('Can not find role :' + request.params.name));
            }
        })
        .catch(error => reply(Boom.badImplementation('An internal server error occurred : ' + error)));
    }
};

exports.getAll = {
    description: 'Returns all roles',
    auth : false,
    handler: function (request, reply) {
                
        const Role = this.models.Role;

        Role.findAll({
            attributes :{
                exclude: ['deleted_at', 'updated_at', 'created_at']
            }
        })
        .then(results => reply(_.map(results, (result => result.get({plain : true})))))
        .catch(error => reply(Boom.badImplementation('An internal server error occurred : ' + error)));
    }
};

exports.post = {
    description: 'Create a new role',
    auth : false,
    validate : {
        payload : {
            name: Joi.string().min(1).max(255).required().description('Role name') 
        }
    },
    handler: function (request, reply) {
        
        const Role = this.models.Role;
        
        Role.create({
            name : request.payload.name
        })
        .then(tag => reply(_.omit(tag.get({plain : true}), 'updated_at', 'created_at')))
        .catch(error => reply(Boom.conflict('An internal server error occurred : ' + error)));
    }
};

exports.delete = {
    description: 'Delete a specific role',
    auth : false,
    validate: {
        params : {
            name: Joi.string().min(1).max(255).required().description('Role name') 
        }
    },
    handler: function (request, reply) {
        
        const Role = this.models.Role;

        Role.destroy({
            where : {
                name : request.params.name
            }
        })
        .then(count => reply({count : count}))
        .catch(error => reply(Boom.badRequest('An internal server error occurred : ' + error)));
    }
};
