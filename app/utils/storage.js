'use strict';

const Path = require('path');
const P = require('bluebird');
const Fs = P.promisifyAll(require('fs'));
const Glob = require('glob');
const Items = require('items');
const Hoek  = require('hoek');
const rm = require('rmdir');
const Easypeazip = require('easypeazip');

const internals = {};

internals.isFolder = path => Fs.statSync(path).isDirectory();

internals.isFile = path => Fs.statSync(path).isFile();

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
            else
            {
               resolve();
            }
        } catch(err) {
            Fs.mkdirSync(path);
            resolve(); // If path does not exists, create and continue.
        }
    });
};

// Removes 'path' recursively
internals.removeRecursively = function(path, callback) {
    rm(path, callback);
};

// Removes 'path' recursively (async)
internals.removeRecursivelyAsync = function(path) {
    return new P((resolve, reject) => {
        internals.removeRecursively(path, resolve);
    });
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


/**
 * Initialize storage.
 */
internals.initialize = function () {
    internals.initializeFolder(internals.relativeTo)
        .then(() => internals.initializeFolder(internals.courseFolder));
};





const load = function() {

    const Storage = {};

    /**
     * Create a course folder.
     */
    Storage.createCourse = function (name) {
        const path = Path.join(internals.courseFolder, name);
        try {
            Fs.mkdirSync(path);
            Fs.mkdirSync(Path.join(path, internals.documents));
        } catch(err) {}
    };


    /**
     * Rename a course folder
     * @return a promise
     */
    Storage.renameCourse = function (oldName, newName) {
        const oldPath = Path.join(internals.courseFolder, oldName);
        const newPath = Path.join(internals.courseFolder, newName);

        return Fs.renameAsync(oldPath, newPath);
    };

    /**
     * Delete the entire course folder
     * @return a promise
     */
    Storage.deleteCourse = function (name) {
        const path = Path.join(internals.courseFolder, name);
        return internals.removeRecursivelyAsync(path);
    };

    Storage.deleteOne = function (course, path) {
        const toDelete = internals.getDocumentPath(course, path);
        return new P((resolve, reject) => {
            try {
                if (internals.isFile(toDelete))
                    internals.deleteFile(toDelete).then(resolve);
                else
                    internals.deleteFolder(toDelete).then(resolve);
            } catch(err) {
                resolve();
            }
        });
    };

    Storage.deleteFiles = function (course, filenames) {
        return new P((resolve, reject) => {
            Items.parallel(filenames, function(filename, next) {

                Storage.deleteOne(course, filename).then(next);

            }, function(err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

    Storage.delete = function(course, filenames) {
        return new P((resolve, reject) => {

            if (Array.isArray(filenames)) {
                Storage.deleteFiles(course, filenames).then(resolve).catch(reject);
            } else {
                Storage.deleteOne(course, filenames).then(resolve).catch(reject);
            }

        });
    };


    Storage.createOrReplaceFile = function (course, path, datafile) {
        const file = internals.getDocumentPath(course, path);
        datafile.pipe(Fs.createWriteStream(file));
    };

    // Returns a promise
    Storage.createFolder = function (course, path) {
        const folder = internals.getDocumentPath(course, path);
        return Fs.mkdirAsync(folder);
    };

    Storage.renameFile = function(course, oldPath, newPath) {
        const oldFile = internals.getDocumentPath(course, oldPath);
        const newFile = internals.getDocumentPath(course, newPath);
        return Fs.renameAsync(oldFile, newFile);
    };

    Storage.download = function(course, path) {

        const document = internals.getDocumentPath(course, path);
        return new P((resolve, reject) => {

            try {

                const isFile = internals.isFile(document);

                if (isFile)
                {
                    return resolve({ result: document, isFile: isFile });
                }
                else
                {
                    Easypeazip.toBuffer(document)
                        .then(buffer => resolve({ result: buffer, isFile: isFile }));
                }

            } catch(err) {
                console.log(err);
                reject(err);
            }
        });
    };

    return Storage;
};



exports.register = function(server, options, next) {

    Hoek.assert(options.root, 'option.root is required');

    internals.root = options.root;
    internals.relativeTo = Path.join(internals.root, options.storage || 'storage');
    internals.courseFolder = Path.join(internals.relativeTo, options.courses || 'courses');
    internals.documents = options.documents || 'documents';

    internals.initialize();
    const Storage = load();
    server.expose('storage', Storage);
    next();
};

exports.register.attributes = {
    name: 'storage',
    version: require('../../package.json').version,
};






