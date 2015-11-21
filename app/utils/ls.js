'use strict';

const Fs   = require('fs');
const Glob = require('glob');
const Path = require('path');
const Hoek = require('hoek');

const internals = {
    defaults: {
        recursive: false,
        nodir: false,
        relativeTo: '/'
    }
};


const ls = function(path, options) {

    options = options || {};
    options = Hoek.applyToDefaults(internals.defaults, options);

    const results = {};
    results.dir = Path.relative(options.relativeTo, Path.dirname(path));

    if (results.dir === '..') {
        results.dir = null;
    }

    const filenames = Glob.sync(Path.join(path, '*'), {
        nodir: options.nodir
    });


    const files = [];

    filenames.forEach(filename => {

        const stat = Fs.statSync(filename);

        if (stat.isDirectory() && options.recursive) {
            files.push({
                dir: Path.relative(options.relativeTo, Path.dirname(filename)),
                name: Path.basename(filename),
                files: ls(filename, options),
                isDirectory: true
            });
        } else {
             const file = {
                dir: Path.relative(options.relativeTo, Path.dirname(filename)),
                name: Path.basename(filename),
                size: stat.size,
                lastUpdated: stat.mtime
            };

            if (!options.recursive) {
                file.isDirectory = stat.isDirectory()
            } else {
                file.isDirectory = false;
            }

            files.push(file);
        }
    });

    results.files = files;

    return results;
};

exports.sync = ls;

/*console.log(JSON.stringify(ls('/home/zyn/Projects/elearning/app' , {
    recursive: true,
    relativeTo: '/home/zyn/Projects/elearning'
}), null, 4));*/
