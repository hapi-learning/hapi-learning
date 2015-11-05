'use strict';

const Path = require('path');
const P = require('bluebird');
const Fs = P.promisifyAll(require('fs'));
const rimraf = require('rimraf');
const Glob = require('glob');
const Items = require('items');

const internals = {};
internals.root = '..';
internals.relativeTo = Path.join(internals.root, 'storage');
internals.courseFolder = Path.join(internals.relativeTo, 'courses');
internals.documents = 'documents';

internals.isFolder = function (path) {

    return Fs.statSync(path).isDirectory();

    return Fs.statAsync(path)
        .then(stats => stats.isDirectory());
};

internals.isFile = function (path) {

    return Fs.statSync(path).isFile();

    return Fs.statAsync(path)
        .then(stats => stats.isFile());
};

// Create folder and remove an existing file
internals.initializeFolder = function (path) {

    return new P((resolve, reject) => {
        try {
            if (!internals.isFolder(path))
            {
                Fs.unlinkAsync(path)
                    .then(() => {
                        Fs.mkdirSync(path);
                        resolve();
                });
            }

            resolve();

        } catch(err) {
            Fs.mkdirSync(path);
            resolve(); // If does not exists, create and continue.
        }
    });
};

// Removes 'path' recursively
internals.removeRecursively = function(path, callback) {
    rimraf(path, callback);
};

// Removes 'path' recursively (async)
internals.removeRecursivelyAsync = function(path) {
    return new P((resolve, reject) => {
        internals.removeRecursively(path, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};


internals.throw = function(err) {
    if (err)
        throw err;
};

/**
 * Initialize storage.
 */
exports.initialize = function () {
    internals.initializeFolder(internals.relativeTo)
        .then(() => internals.initializeFolder(internals.courseFolder));
};

/**
 * Create a course folder.
 */
exports.createCourse = function (name) {
    const path = Path.join(internals.courseFolder, name);
    Fs.mkdirSync(path);
    Fs.mkdirSync(Path.join(path, internals.documents));
};

/**
 * Rename a course folder
 * @return a promise
 */
exports.renameCourse = function (oldName, newName) {
    const oldPath = Path.join(internals.courseFolder, oldName);
    const newPath = Path.join(internals.courseFolder, newName);

    return Fs.renameAsync(oldPath, newPath);
};

/**
 * Delete the entire course folder
 * @return a promise
 */
exports.deleteCourse = function (name) {
    const path = Path.join(internals.courseFolder, name);
    return internals.removeRecursivelyAsync(path);
};

// Removes folder / files in parallel
internals.removeParallel = function(filenames) {
    return new P((resolve, reject) => {
        Items.parallel(filenames, function(filename, next) {
            internals.removeRecursivelyAsync(filename).then(next);
        }, function(err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};

// Returns the path of the file in the course
internals.getDocumentPath = function(course, path) {
    return Path.join(internals.courseFolder, course, internals.documents, path);
};

/**
 * This deletes the documents folder only if the path is '/'.
 */
internals.deleteFolder = function (path) {

    path = path.replace(/\/$/, ''); // Removes trailing slash
    const filenames = Glob.sync(path + '/*');

    return internals.removeParallel(filenames);
};

internals.deleteFile = function (path) {
    return Fs.unlinkAsync(path);
};

exports.delete = function (course, path) {
    const toDelete = internals.getDocumentPath(course, path);
    return new P((resolve, reject) => {
        try {
            if (internals.isFile(toDelete))
                exports.deleteFile(toDelete).then(resolve);
            else
                exports.deleteFolder(toDelete).then(resolve);
        } catch {
            resolve();
        }
    });
};

exports.deleteFiles = function (course, filenames) {
    return new P((resolve, reject) => {
        Items.parallel(filenames, function(filename, next) {

            exports.delete(course, filename).then(next);

        }, function(err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};

exports.createOrReplaceFile = function (course, path, data) {
    const file = internals.getDocumentPath(course, path);
    return Fs.writeFileAsync(file, data);
};

exports.renameFile(course, oldPath, newPath) {
    const oldFile = internals.getDocumentPath(course, oldPath);
    const newFile = internals.getDocumentPath(course, newPath);
    return Fs.renameAsync(oldFile, newFile);
};
