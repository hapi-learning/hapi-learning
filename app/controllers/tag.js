'use strict';

const Joi = require('joi');

const Utils = require('../utils/sequelize');

exports.get = {
    description: 'Returns a specific tag',
    validate: {
        params: {
            name: Joi.string().min(1).max(255).required().description('Tag name')
        }
    },
    handler: function (request, reply) {

        const Tag = this.models.Tag;

        Tag.findOne({
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
                return reply.notFound('Cannot find tag :' + request.params.name);
            }
        })
        .catch(err => reply.badImplementation(err));
    }
};

exports.getAll = {
    description: 'Returns all tags',
    handler: function (request, reply) {

        const Tag = this.models.Tag;

        Tag.findAll({
            attributes :{
                exclude: ['deleted_at', 'updated_at', 'created_at']
            }
        })
        .then(results => reply(Utils.removeDates(results)))
        .catch(err => reply.badImplementation(err));
    }
};

exports.post = {
    description: 'Create a new tag',
    validate : {
        payload : {
            name: Joi.string().min(1).max(255).required().description('Tag name')
        }
    },
    handler: function (request, reply) {

        const Tag = this.models.Tag;

        Tag.create({
            name : request.payload.name
        })
        .then(result => reply(Utils.removeDates(result)).code(201))
        .catch(() => reply.conflict());
    }
};

exports.delete = {
    description: 'Delete a specific tag',
    validate: {
        params : {
            name: Joi.string().min(1).max(255).required().description('Tag name')
        }
    },
    handler: function (request, reply) {

        const Tag = this.models.Tag;

        Tag.destroy({
            where : {
                name : request.params.name
            }
        })
        .then(count => reply({count : count}))
        .catch(err => reply.badRequest(err));
    }
};
