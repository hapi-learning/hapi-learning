'use strict';

const Path = require('path');
const P = require('bluebird');
const Fs = P.promisifyAll(require('fs'));
const rimraf = require('rimraf');

const internals = {};
internals.root = '..';
internals.storageFolder = 'storage';
internals.relativeTo = Path.join(internals.root, internals.storageFolder);
internals.courseFolder = 'courses';
internals.relativeToCourseFolder = Path.join(internals.relativeTo, internals.courseFolder);

internals.isFolder = function (path) {
    return Fs.statAsync(path)
        .then(stats => stats.isDirectory());
};

internals.isFile = function (path) {
    return Fs.statAsync(path)
        .then(stats => stats.isFile());
};

internals.initializeFolder = function (path) {
    internals
        .isFolder(path)
        .then(isFolder => {
            if (!isFolder) {
                Fs.unlinkAsync(path)
                    .then(() => Fs.mkdirSync(path));
            }
        })
        .catch(() => Fs.mkdirSync(path));
};

internals.removeRecursively = function(path, callback) {
    rimraf(path, callback);
};

internals.throw = function(err) {
    if (err)
        throw err;
};

/**
 * Initialize storage.
 */
exports.initialize = function () {

    P.resolve(internals.initializeFolder(internals.relativeTo))
        .then(() => internals.initializeFolder(internals.relativeToCourseFolder));
};

/**
 * Create a course folder.
 * @return a promise
 */
exports.createCourse = function (name) {
    const path = Path.join(internals.relativeToCourseFolder, name);

    return Fs.mkdirAsync(path);
};

/**
 * Rename a course folder
 * @return a promise
 */
exports.renameCourse = function (oldName, newName) {
    const oldPath = Path.join(internals.relativeToCourseFolder, oldName);
    const newPath = Path.join(internals.relativeToCourseFolder, newName);

    return Fs.renameAsync(oldPath, newPath);
};

/**
 * Delete the entire course folder
 * @return a promise
 */
exports.deleteCourse = function (name) {
    const path = Path.join(internals.relativeToCourseFolder, name);
    return new Promise((resolve, reject) => {
        internals.removeRecursively(path, (err) => {
            if (err)
                reject();
            else
                resolve();
        });
    });
};


