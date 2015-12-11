'use strict';

const Joi = require('joi');

const Utils = require('../utils/sequelize');

/**
 * @api {get} /tags/:name Get one tag
 * @apiName GetTag
 * @apiGroup Tags
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/tags/XYZ
 *
 * @apiDescription Not very useful route because tag is just a name, but still exists.
 *
 * @apiPermission all users.
 *
 * @apiParam (path) {String[]} name The tag name.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The tag.
 *
 * @apiError {json} 400 Validation error.
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 404 Tag not found.
 *
 */
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

/**
 * @api {get} /tags/:name Get all tags
 * @apiName GetTags
 * @apiGroup Tags
 * @apiVersion 1.0.0
 * @apiExample {curl} Example usage:
 *      curl http://localhost/tags
 *
 * @apiPermission all users.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 An array of tags.
 *
 * @apiError {json} 401 Invalid token or token expired.
 *
 */
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

/**
 * @api {post} /tags Post a tag
 * @apiName PostTag
 * @apiGroup Tags
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (payload) {String} name The tag name.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The created tag.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 409 Tag already exists.
 */
exports.post = {
    description: 'Create a new tag',
    auth: {
        scope: ['admin', 'teacher']
    },
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

/**
 * @api {delete} /tags Delete a tag
 * @apiName DeleteTag
 * @apiGroup Tags
 * @apiVersion 1.0.0
 *
 * @apiPermission admin and teachers.
 *
 * @apiParam (path) {String} name The tag name.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The created tag.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 409 Tag already exists.
 */
exports.delete = {
    description: 'Delete a specific tag',
    auth: {
        scope: ['admin', 'teacher']
    },
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
