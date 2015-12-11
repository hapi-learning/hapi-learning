'use strict';

const Joi = require('joi');
const _ = require('lodash');
const Utils = require('../utils/sequelize');

/**
 * @api {get} /roles/:name Get a role
 * @apiName GetRole
 * @apiGroup Roles
 * @apiVersion 1.0.0
 *
 * @apiPermission admin.
 *
 * @apiParam (path) {String} name The role name.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 The role.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 404 Role not found.
 */
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

/**
 * @api {get} /roles Get all roles
 * @apiName GetRoles
 * @apiGroup Roles
 * @apiVersion 1.0.0
 *
 * @apiPermission admin.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 200 All the roles.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 */
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

/**
 * @api {post} /roles Post a role
 * @apiName PostRole
 * @apiGroup Roles
 * @apiVersion 1.0.0
 *
 * @apiPermission admin.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess {json} 201 The created role.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 * @apiError {json} 409 Conflict - role name already exists.
 */
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

/**
 * @api {delete} /roles Delete a role
 * @apiName DeleteRole
 * @apiGroup Roles
 * @apiVersion 1.0.0
 *
 * @apiPermission admin.
 *
 * @apiParam (path) {String} name the role name.
 *
 * @apiheader {String} Authorization The user's private token.
 *
 * @apiSuccess 204 No content.
 *
 * @apiError {json} 401 Invalid token or token expired.
 * @apiError {json} 403 Forbidden - insufficient permissions.
 */
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
        .then(count => reply().code(204))
        .catch(error => reply.badImplementation(error));
    }
};
