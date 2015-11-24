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


// Returns the path of the file in the course
internals.getDocumentPath = function(course, path, doNotEncode) {
    if (doNotEncode) {
        return Path.join(internals.courseFolder, encodeURI(course), internals.documents, path);
    } else {
        return Path.join(internals.courseFolder, encodeURI(course), internals.documents, encodeURI(path));
    }
};

/**
 * This deletes the documents folder only if the path is '/'.
 */
internals.deleteFolder = function (path) {
    // DELETE ALL FILES/DIRECTORY WHERE DIR BEGINS WITH PATH
    return internals.removeRecursivelyAsync(path);
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

internals.createFile = function(data) {
     return internals.File.create(data);
};

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
    Storage.deleteCourse = function (code) {
        return new P(function(resolve, reject) {
            const path = Path.join(internals.courseFolder, code, true);
            internals.removeRecursivelyAsync(path).finally(function() {
                internals.File.destroy({
                    where: {
                        course_code: name
                    }
                }).finally(resolve);
            });
        });
    };

    Storage.deleteOne = function (course, path) {
        const toDelete = internals.getDocumentPath(course, path, true);
        return new P((resolve, reject) => {
            try {

                let directory = Path.dirname(path);
                if (directory === '.') {
                    directory = '/';
                }

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
                    internals.deleteFolder(toDelete).finally(function() {

                        internals.File.destroy({
                            where: {
                                course_code: course,
                                $or: [{
                                    directory: {
                                        $like: path + '%'
                                    }
                                }, {
                                    $and: [{
                                        directory: {
                                            $eq: directory
                                        }
                                    }, {
                                        name: {
                                            $eq: Path.basename(path)
                                        }
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

    Storage.deleteFiles = function (course, filenames) {
        return new P((resolve, reject) => {
            Items.parallel(filenames, function(filename, next) {

                Storage.deleteOne(course, filename).then(next);

            }, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
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



    Storage.createOrReplaceFile = function (course, path, datafile, hidden) {
        return new P(function (resolve, reject) {
            const file = internals.getDocumentPath(course, path, true);
            datafile.pipe(Fs.createWriteStream(file));

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

                const stat = Fs.statSync(file);

                const data = {
                    name: datafile.hapi.filename,
                    directory: Path.dirname(path),
                    type: 'f',
                    size: stat.size,
                    ext: Path.extname(path),
                    course_code: course,
                    hidden: hidden
                };

                if (result) {
                    return internals.replaceFile(result, data).then(resolve);
                } else {
                    return internals.createFile(data).then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    };

    // Returns a promise
    Storage.createFolder = function (course, path, hidden) {

        return new P(function(resolve, reject) {
            const folder = internals.getDocumentPath(course, path, true);
            let directory = Path.dirname(path);
            if (directory === '.') {
                directory = '/';
            }


            internals.File.findOne({
                where: {
                    course_code: course,
                    directory: directory,
                    name: Path.basename(path)
                }
            }).then(function(result) {
                if (result) {
                    reject(409);
                } else {
                    Fs.mkdirAsync(folder).then(function() {
                        internals.File.create({
                            name: Path.basename(path),
                            directory: directory,
                            type: 'd',
                            size: null,
                            ext: null,
                            course_code: course,
                            hidden: hidden
                        }).then(resolve).catch(() => reject(500));
                    }).catch(() => reject(422));
                }
            }).catch(() => reject(500));

        });
    };

      // Returns a promise
    Storage.updateFolder = function (course, path, name, hidden) {


        return new P(function(resolve, reject) {

            const oldFolder = internals.getDocumentPath(course, path, true);
            const newFolder = internals.getDocumentPath(course, Path.dirname(path) + '/' + name, true);

            let directory = Path.dirname(path);
            if (directory === '.') {
                directory = '/';
            }


            const doRename = function() {

                internals.File.findOne({
                    where: {
                        name: Path.basename(path),
                        directory: directory,
                        course_code: course,
                    }
                }).then(function(result) {
                    if (result) {

                        // Against undefined
                        if (typeof hidden !== 'undefined' && hidden !== null) {
                            result.set('hidden', hidden);
                        }

                        const rename = function() {
                            return Fs.renameAsync(oldFolder, newFolder);
                        };

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
                                rename().then(function() {
                                    result.save();
                                    resolve();
                                });
                            }).catch(() => reject(500));
                        } else {
                            rename().then(function() {
                                result.save();
                                resolve();
                            });
                        }

                    } else {
                        reject(404);
                    }
                }).catch(() => reject(500));

            };

            // Check if folder already exists
            internals.File.findOne({
                where: {
                    name: name,
                    directory: directory,
                    course_code: course
                }
            }).then(function(result) {
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
                reject(err);
            }
        });
    };

    Storage.getTree = function(course, path, recursive) {
        Hoek.assert(course, 'course is required');
        Hoek.assert(path, 'path is required');

        recursive = recursive || false;

        const document = internals.getDocumentPath(course, path, true);
        const relativeTo = Path.join(internals.courseFolder, encodeURI(course), internals.documents);
        return require('./ls').sync(document, {
            recursive: recursive,
            relativeTo: relativeTo
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






