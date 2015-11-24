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


// Returns true if path is a folder, false otherwise
internals.isFolder = path => Fs.statSync(path).isDirectory();

// Returns true if path is a file, false otherwise
internals.isFile = path => Fs.statSync(path).isFile();

// Create folder and remove an existing file
internals.initializeFolder = function (path) {

    return new P((resolve, reject) => {
        try {
            if (!internals.isFolder(path)) {
                Fs.unlinkAsync(path).then(function() {
                        Fs.mkdirSync(path);
                        resolve();
                });
            } else {
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


// Returns the absolute path of the file in the course folder
internals.getDocumentPath = function(course, path) {
    return Path.join(internals.courseFolder, course, internals.documents, path);
};

// Deletes a folder
internals.deleteFolder = function (path) {
    return internals.removeRecursivelyAsync(path);
};

// Deletes a file
internals.deleteFile = function (path) {
    return Fs.unlinkAsync(path);
};

// Initialize the storage by creating the folders storage/courses
internals.initialize = function () {

    internals.initializeFolder(internals.relativeTo)
        .then(() => internals.initializeFolder(internals.courseFolder));
};

// Create file in the db
internals.createFile = function(data) {
     return internals.File.create(data);
};

// Replace file in the db
internals.replaceFile = function(file, data) {
    // Directory and type do not change.

    return new P(function(resolve, reject) {
        file.set('name', data.name); // ext is set in the name setter
        file.set('hidden', data.hidden);
        file.set('size', data.size);
        file.save();
        resolve();
    });
};

// Delete a file in the file system
internals.deleteOne = function (course, path) {
    const toDelete = internals.getDocumentPath(course, path);
    return new P((resolve, reject) => {
        try {

            const directory = internals.replaceDirectory(path);

            // Delete the file and delete the entry in the database
            if (internals.isFile(toDelete)) {
                internals.deleteFile(toDelete).finally(function() {

                    internals.File.destroy({
                        where: {
                            course_code: course,
                            directory: directory,
                            name: Path.basename(path)
                        }
                    }).finally(resolve);

                });

            } else {
                // Delete the folder and delete all the entries of this folder
                // and subfolders in the database
                internals.deleteFolder(toDelete).finally(function() {

                    // DELETE files WHERE course_code = {course}
                    // AND (directory LIKE {path}% OR
                    // (directory = {directory} AND name = {Path.basename(path)}))
                    internals.File.destroy({
                        where: {
                            course_code: course,
                            $or: [{
                                directory: { $like: path + '%' }
                            }, {
                                $and: [{
                                    directory: { $eq: directory }
                                }, {
                                    name: { $eq: Path.basename(path) }
                                }]
                            }]
                        }
                    }).finally(resolve);

                });
            }
        } catch(err) {
            resolve(); // does not exists -> continue
        }
    });
};

// Returns the directory of the path
// If the directory is '.', replaces it by '/' (the root of the course)
// Path.dirname('folder') returns '.' and the directory of 'folder' is '/'
// in this case (root of the course)
internals.replaceDirectory = function(path) {
    let dir = Path.dirname(path);
    if (dir === '.') {
        dir = '/';
    }

    return dir;
}

// Deletes files in the file system
internals.deleteFiles = function (course, filenames) {
    return new P((resolve, reject) => {
        Items.parallel(filenames, function(filename, next) {

            internals.deleteOne(course, filename).then(next);

        }, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};


const load = function() {

    const Storage = {};

    /**
     * Create the folders {course_code}/documents
     */
    Storage.createCourse = function (name) {
        const path = Path.join(internals.courseFolder, name);
        try {
            Fs.mkdirSync(path);
            Fs.mkdirSync(Path.join(path, internals.documents));
        } catch(err) {}
    };


    /**
     * Rename a course folder and rename the code in the database entries
     */
    Storage.renameCourse = function (oldName, newName) {
        const oldPath = Path.join(internals.courseFolder, oldName);
        const newPath = Path.join(internals.courseFolder, newName);

        return new P(function(resolve, reject) {
            Fs.renameAsync(oldPath, newPath).then(function() {
                internals.File.update({
                    course_code: newName
                }, {
                    where: {
                        course_code: oldName
                    }
                }).then(resolve).catch(reject);
            }).catch(reject);
        });

    };

    /**
     * Delete the entire course folder and the database entries (files)
     */
    Storage.deleteCourse = function (code) {
        return new P(function(resolve, reject) {
            const path = Path.join(internals.courseFolder, code);
            internals.removeRecursivelyAsync(path).finally(function() {
                internals.File.destroy({
                    where: {
                        course_code: code
                    }
                }).finally(resolve);
            });
        });
    };

    /**
     * Deletes file(s)
     */
    Storage.delete = function(course, filenames) {
        return new P((resolve, reject) => {

            if (Array.isArray(filenames)) {
                internals.deleteFiles(course, filenames).then(resolve).catch(reject);
            } else {
                internals.deleteOne(course, filenames).then(resolve).catch(reject);
            }

        });
    };

    /**
     * Create or replace a file.
     * Create or update the database entry corresponding to the file.
     */
    Storage.createOrReplaceFile = function (course, path, datafile, hidden) {
        return new P(function (resolve, reject) {
            const file = internals.getDocumentPath(course, path);
            datafile.pipe(Fs.createWriteStream(file));

            // Check if the file exists
            internals.File.findOne({
                where: {
                    name: datafile.hapi.filename,
                    directory: Path.dirname(path),
                    course_code: course
                }
            }).then(result => {

                 // undefined or null
                if (!hidden) {
                    hidden = false;
                }

                // The data of the database entry
                const data = {
                    name: datafile.hapi.filename,
                    directory: Path.dirname(path),
                    type: 'f',
                    size: Fs.statSync(file).size,
                    ext: Path.extname(path),
                    course_code: course,
                    hidden: hidden
                };

                // If the file exists, replace (update) it, otherwise, create it.
                if (result) {
                    return internals.replaceFile(result, data).then(resolve);
                } else {
                    return internals.createFile(data).then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    };

    /**
     * Creates a folder and the database entry of this folder.
     */
    Storage.createFolder = function (course, path, hidden) {

        return new P(function(resolve, reject) {
            const folder = internals.getDocumentPath(course, path);
            const directory = internals.replaceDirectory(path);

            // Check if the directory exists
            internals.File.findOne({
                where: {
                    course_code: course,
                    directory: directory,
                    name: Path.basename(path)
                }
            }).then(function(result) {

                // if it exists, send 409 (conflict), otherwise, creates it
                if (result) {
                    reject(409);
                } else {

                    // if the mkdir fails, the path is invalid, sends 422 bad data
                    Fs.mkdirAsync(folder).then(function() {

                        internals.File.create({
                            name: Path.basename(path),
                            directory: directory,
                            type: 'd',
                            size: null,
                            ext: null,
                            course_code: course,
                            hidden: hidden
                        }).then(resolve).catch(err => reject(500));

                    }).catch(() => reject(422));
                }

            }).catch(() => reject(500));

        });
    };

    /**
     * Updates a folder
     */
    Storage.updateFolder = function (course, path, name, hidden) {

        return new P(function(resolve, reject) {

            const directory = internals.replaceDirectory(path);

            const doRename = function() {

                // Check if folder exists
                internals.File.findOne({
                    where: {
                        name: Path.basename(path),
                        directory: directory,
                        course_code: course,
                    }
                }).then(function(result) {

                    // If the folder exists, update, otherwise sends 404 not found
                    if (result) {

                        // Against undefined
                        if (typeof hidden !== 'undefined' && hidden !== null) {
                            result.set('hidden', hidden);
                        }


                        const rename = function(r) {
                            return Storage
                                .renameFile(course, path, Path.dirname(path) + '/' + name)
                                .then(function() {
                                    r.save();
                                    resolve();
                                });

                        };

                        // If new name has been given, update name
                        if (name) {
                            result.set('name', name);
                            internals.File.update({
                                directory: Path.dirname(path) + '/' + name
                            }, {
                                where: {
                                    directory: path,
                                    course_code: course
                                }
                            }).then(function() {
                                rename(result);
                            }).catch(() => reject(500));
                        } else {
                            rename(result);
                        }

                    } else {
                        reject(404);
                    }
                }).catch(() => reject(500));

            };

            // Check if folder with the new name already exists
            internals.File.findOne({
                where: {
                    name: name,
                    directory: directory,
                    course_code: course
                }
            }).then(function(result) {
                // Sends 409 conflict if the new name already exists, otherwise rename
                if (result) {
                    reject(409);
                } else {
                    return doRename();
                }
            }).catch(function() {
                reject(500);
            });

        });
    };

    /**
     * Rename a file
     */
    Storage.renameFile = function(course, oldPath, newPath) {
        const oldFile = internals.getDocumentPath(course, oldPath);
        const newFile = internals.getDocumentPath(course, newPath);
        return Fs.renameAsync(oldFile, newFile);
    };

    /**
     * Download a folder or file
     */
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
                reject(err);
            }
        });
    };

    /**
     * Get the tree of the path.
     * Can be recursive or not.
     */
    Storage.getTree = function(course, path, recursive) {
        Hoek.assert(course, 'course is required');
        Hoek.assert(path, 'path is required');

        recursive = recursive || false;

        const document = internals.getDocumentPath(course, path);
        const relativeTo = Path.join(internals.courseFolder, encodeURI(course), internals.documents);
        return require('./ls').sync(document, {
            recursive: recursive,
            relativeTo: relativeTo
        });
    };

    Storage.getList = function(course, path) {

        return new P(function(resolve, reject) {
            internals.File.findAll({
                where: {
                    directory: path,
                    course_code: course
                }
            }).then(function(results) {
                console.log('PATH', path);
                let directory;
                if (path === '/') {
                    directory = null
                } else {
                    directory = internals.replaceDirectory(path);
                }
                console.log('DIRECTORY', directory);
                resolve({
                    dir: directory,
                    files: results
                });
            }).catch(reject);
        });
    };

    return Storage;
};



exports.register = function(server, options, next) {

    Hoek.assert(options.root, 'option.root is required');

    internals.File = server.plugins.models.models.File;

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
    dependencies: 'models'
};






