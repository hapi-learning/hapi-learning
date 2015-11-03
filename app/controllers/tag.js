'use strict';

const Joi = require('joi');
const Boom = require('boom');

exports.get = {
    description: 'Returns a specific tag',
    auth : false,
    validate: {
        params: {
            name: Joi.string().min(1).max(255).required().description('Tag name')
        }
    },
    handler: function (request, reply) {
        
        const Tag = this.models.Tag;
        
        Tag.findAll({
            where: {
                name : request.params.name
            }
        })
        .catch(error => reply(Boom.badRequest(error)))
        .then(result => reply(result));
    }
};

exports.getAll = {
    description: 'Returns all tags',
    auth : false,
    handler: function (request, reply) {
                
        const Tag = this.models.Tag;

        Tag.findAll()
        .catch(error => reply(Boom.badRequest(error)))
        .then(results => reply(results));
    }
};

exports.post = {
    description: 'Create a new tag',
    auth : false,
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
        .then(tag => reply(tag))
        .catch(error => reply(Boom.badRequest(error)));
    }
};

exports.delete = {
    description: 'Delete a specific tag',
    auth : false,
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
        .then(tag => reply(tag))
        .catch(error => reply(error));
    }
};
