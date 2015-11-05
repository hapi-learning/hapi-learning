'use strict';

const JSzip = require('jszip');
const glob  = require('glob');
const fs    = require('fs');
const items = require('items');
const Path  = require('path');

const internals = {};

internals.getDirectoryFileNames = function(path) {
    return glob.sync(Path.join(path, '**', '*'), { nodir: true });
};

internals.getPathFileNames = function(path) {
    let stat = fs.statSync(path);
    let filenames = [];

    if (stat.isDirectory())
        filenames = internals.getDirectoryFileNames(path);
    else
        filenames.push(path);

    return filenames;
};

internals.getFileNames = function(path) {

    let filenames = [];

    if (Array.isArray(path)) {

        path.forEach(p => {
            filenames = filenames.concat(internals.getPathFileNames(p));
        });

    } else {
        filenames = internals.getPathFileNames(path);
    }

    return filenames;
};


exports.toBuffer = function(path) {

    const filenames = internals.getFileNames(path);

    let zip = new JSzip();

    return new Promise((resolve, reject) => {

        items.parallel(filenames, function(filename, next) {

            zip.file(filename, fs.readFileSync(filename));

            next();
        }, function(err) {
           if (err) {
               reject(err);
           } else {
               resolve(zip.generate({ type: 'nodebuffer' }));
           }
        });
    });
};

exports.toZipFile = function(path, zipFile) {

    return new Promise((resolve, reject) => {
        exports.toBuffer(path).then(buffer => {
           fs.writeFile(zipFile, buffer, function(err) {
                if (err)
                    reject(err);
                else
                    resolve();
           });
        });

    });
};

exports.toZipFile('node_modules/glob', 'modules.zip')
    .then(() => console.log('fini'))
    .catch(console.log);

