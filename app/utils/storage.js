'use strict';

const Path = require('path');
const P = require('bluebird');
const Fs = P.promisifyAll(require('fs'));
const Glob = require('glob');
const Items = require('items');
const Hoek  = require('hoek');
const rm = require('rmdir');
const Easypeazip = require('easypeazip');
const _ = require('lodash');


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
};

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

/**
 * Rename a file
 */
internals.renameFile = function(course, oldPath, newPath) {
    const oldFile = internals.getDocumentPath(course, oldPath);
    const newFile = internals.getDocumentPath(course, newPath);
    return Fs.renameAsync(oldFile, newFile);
};

internals.updateFolder = function(file, course, path, data, rename) {

    return new P(function(resolve, reject) {

        const attributes = {};

        if (typeof data.hidden !== 'undefined' && data.hidden !== null) {
            attributes.hidden = data.hidden;
        }

        if (data.name) {
            let directory = internals.replaceDirectory(path);
            if (directory !== '/') {
                directory += '/';
            } else {
                directory = '';
            }
            attributes.directory = directory + data.name;
        }

        internals.File.update(attributes, {
            where: {
                directory: path,
                course_code: course
            }
        }).then(function() {
            if (rename) {
                rename(file, course, path, data.name).then(resolve).catch(reject);
            } else {
                resolve();
            }
        }).catch(err => reject({statusCode: 500, message: err}));
    });
};

internals.update = function(file, course, path, data) {

    const hidden = data.hidden;
    const name   = data.name;
    const type   = file.get('type');

    return new P(function(resolve, reject) {


        // Against undefined
        if (typeof hidden !== 'undefined' && hidden !== null) {
            file.set('hidden', hidden);
        }

        const save = function() {
            file.save().then(resolve).catch(() => reject({statusCode: 422, message: 'Bad data'}));
        };

        if (name) {

            file.set('name', name);

            // Rename folder / file
            const rename = function(file, course, path, name) {
                return new Promise(function(resolve, reject) {
                    internals
                        .renameFile(course, path, Path.dirname(path) + '/' + name)
                        .then(resolve).catch(() => reject({statusCode: 422, message: 'Bad data'}));
                });
            };

            if (type === 'f') {
                rename(file, course, path, name).then(save).catch(reject);
            } else {
                internals
                    .updateFolder(file, course, path, data, rename)
                    .then(save).catch(reject);
            }
        } else {

            // If the name has not changed, just update all
            // the files in a directory
            if (type === 'd') {
                internals.updateFolder(file, course, path, { hidden: hidden })
                    .then(save).catch(reject);
            } else {
                save();
            }

        }
    });
};


const load = function() {

    const Storage = {};

    /**
     * Create the folders {course_code}/documents
     */
    Storage.createCourse = function (name, homepage) {
        const path = Path.join(internals.courseFolder, name);
        try {
            Fs.mkdirSync(path);
            Fs.writeFileSync(Path.join(internals.courseFolder, name, internals.homepage), homepage || '');
            Fs.mkdirSync(Path.join(path, internals.documents));
        } catch(err) {}
    };


    /**
     * Rename a course folder and rename the code in the database entries
     */
    Storage.renameCourse = function (oldName, newName) {
        const oldPath = Path.join(internals.courseFolder, oldName);
        const newPath = Path.join(internals.courseFolder, newName);

            return Fs.renameAsync(oldPath, newPath).then(function() {
                return internals.File.update({
                    course_code: newName
                }, {
                    where: {
                        course_code: oldName
                    }
                });
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

            datafile.on('end', function() {

                // Check if the file exists
                internals.File.findOne({
                    where: {
                        name: datafile.hapi.filename,
                        directory: Path.dirname(path),
                        course_code: course
                    }
                }).then(result => {

                    // TODO select directory and check if hidden or not


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
                    reject({statusCode: 409, message: 'The folder name already exists'});
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
                        }).then(resolve).catch(err => reject({statusCode: 500, message: err}));

                    }).catch(() => reject({statusCode: 422, message: 'Bad data'}));
                }

            }).catch(err => reject({statusCode: 500, message: err}));

        });
    };




    Storage.update = function(course, path, data) {

        const directory = internals.replaceDirectory(path);
        const oldName = Path.basename(path);

        const name   = data.name;
        const hidden = data.hidden;

        return new P(function(resolve, reject) {

            internals.File.findOne({
                where: {
                    name: oldName,
                    directory: directory,
                    course_code: course,
                }
            }).then(function(result) {
                if (result) {
                    // if the names are equals, just update hidden
                    // otherwise, check if the new name already exists and update
                    if (name === oldName) {
                        internals.update(result, course, path, data).then(function() {
                            resolve(result);
                        }).catch(reject);
                    } else {
                        // Check if already exists with the new name
                        internals.File.findOne({
                            where: {
                                name: name,
                                directory: directory,
                                course_code: course
                            }
                        }).then(function(existingFile) {
                            // Sends 409 conflict if the new name already exists, otherwise rename
                            if (existingFile) {
                                reject({statusCode: 409, message: 'The name already exists'});
                            } else {
                                internals.update(result, course, path, data).then(function() {
                                    resolve(result);
                                }).catch((err) => reject({statusCode: 500, message: err}));
                            }
                        }).catch(function() {
                            reject({statusCode: 500, message: err});
                        });
                    }

                } else {
                    reject({statusCode: 404, message: 'File not found'});
                }
            }).catch(function(err) {
                reject({statusCode: 500, message: err});
            });


        });
    };



    /**
     * Download a folder or file
     */
    Storage.download = function(course, path, getHidden) {

        const directory = internals.replaceDirectory(path);
        const name = Path.basename(path);

        return new P((resolve, reject) => {

            internals.File.findOne({
                where: {
                    course_code: course,
                    name: name,
                    directory: directory,
                }
            }).then(function(result) {


                if (!result && path !== '/') {
                    reject({statusCode: 404, message: 'File / folder not found'});
                } else {

                    const isFile = (result ? (result.get('type') === 'f') : false);

                    if (isFile) {
                        resolve({
                            result: internals.getDocumentPath(course, path),
                            isFile: isFile,
                            size: result.get('size')
                        });
                    } else {
                        const dir = (path === '/') ? '' : path;
                        const where = {
                            directory: {
                                $like: dir + '%'
                            },
                            course_code: course
                        };

                        if (!getHidden) {
                            where.hidden = false;
                        }

                        internals.File.findAll({
                            where: where
                        }).then(function(results) {

                            const baseUrl = internals.getDocumentPath(course, Path.dirname(path));
                            const files = _.filter(results, r => r.get('type') === 'f');

                            const documents = _.map(files, f => {
                                const d = {};
                                d.prefix = baseUrl;
                                if (f.get('directory') === '/') {
                                    d.name = f.get('name');
                                } else {
                                    d.name = Path.join(f.get('directory'), f.get('name'));
                                }
                                return d;
                            });

                            Easypeazip.toBuffer(documents)
                                .then(buffer => resolve({ result: buffer, isFile: isFile }))
                                .catch(err => reject({statusCode: 500, message: err}));

                        }).catch(function(err) {
                            reject({statusCode: 500, message: err});
                        });


                    }
                }
            });

        });
    };


    Storage.getList = function(course, path, hidden) {

        const where = {
            directory: path,
            course_code: course
        };

        if (!hidden) {
            where.hidden = hidden;
        }

        return internals.File.findAll({
            where: where
        }).then(function(results) {
            // directory is the parent dir
            let directory;
            if (path === '/') {
                directory = null;
            } else {
                directory = internals.replaceDirectory(path);
            }

            return {
                dir: directory,
                files: results
            };
        });
    };

    Storage.getHomepage = function(course) {
        return Path.join(internals.courseFolder, course, internals.homepage);
    };

    Storage.setHomepage = function(course, content) {
        const path = Storage.getHomepage(course);
        return Fs.writeFileAsync(path, content);
    };

    return Storage;
};



exports.register = function(server, options, next) {

    Hoek.assert(options.root, 'option.root is required');

    internals.File = server.app.models.File;

    internals.root = options.root;
    internals.relativeTo = Path.join(internals.root, options.storage || 'storage');
    internals.courseFolder = Path.join(internals.relativeTo, options.courses || 'courses');
    internals.documents = options.documents || 'documents';
    internals.homepage = 'homepage';

    internals.initialize();

    const Storage = load();

    server.app.storage = Storage;
    next();
};

exports.register.attributes = {
    name: 'storage',
    version: require('../../package.json').version,
    dependencies: 'models'
};






