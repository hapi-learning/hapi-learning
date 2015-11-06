'use strict';

const JSzip = require('jszip');
const glob  = require('glob');
const fs    = require('fs');
const items = require('items');
const Path  = require('path');

const internals = {};

internals.getDirectoryFileNames = function(path) {
    const paths = glob.sync(Path.join(path, '**', '*'), { nodir: true });

    let filenames = [];

    paths.forEach(file => {
        const dir = Path.parse(path).dir;
        filenames.push({ name: Path.relative(dir, file), prefix: dir});
    });

    return filenames;
};

internals.getPathFileNames = function(path) {
    let stat = fs.statSync(path);
    let filenames = [];

    if (stat.isDirectory())
        filenames = internals.getDirectoryFileNames(path);
    else
        filenames.push({
            name: Path.basename(path),
            prefix: Path.parse(path).dir
        });

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

            zip.file(filename.name, fs.readFileSync(Path.join(filename.prefix, filename.name)));
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

