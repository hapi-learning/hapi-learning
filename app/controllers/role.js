'use strict';

const Joi = require('joi');
const _ = require('lodash');
const Utils = require('../utils/sequelize');


exports.get = {
    description: 'Returns a specific role',
    auth: {
        scope: ['admin']
    },
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
                return reply.notFound('Cannot find role :' + request.params.name);
            }
        })
        .catch(err => reply.badImplementation(err));
    }
};

exports.getAll = {

    description: 'Returns all roles',
    auth: {
        scope: ['admin']
    },
    handler: function (request, reply) {

        const Role = this.models.Role;

        Role.findAll({
            attributes :{
                exclude: ['deleted_at', 'updated_at', 'created_at']
            }
        })
        .then(results => reply(_.map(results, (result => result.get({plain : true})))))
        .catch(err => reply.badImplementation(err));
    }
};

exports.post = {
    description: 'Create a new role',
    auth: {
        scope: ['admin']
    },
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
        .then(tag => reply(Utils.removeDates(tag)).code(201))
        .catch(() => reply.conflict());
    }
};

exports.delete = {
    description: 'Delete a specific role',
    auth: {
        scope: ['admin']
    },
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
        .catch(error => reply.badImplementation(error));
    }
};
