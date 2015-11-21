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

    const results = [];

    const filenames = Glob.sync(Path.join(path, '*'), {
        nodir: options.nodir
    });



    filenames.forEach(filename => {

        const stat = Fs.statSync(filename);

        if (stat.isDirectory() && options.recursive) {
            results.push({
                dir: Path.relative(options.relativeTo, Path.dirname(filename)),
                name: Path.basename(filename),
                files: ls(filename, options),
                isDirectory: true
            });
        } else {
             const file = {
                dir: Path.relative(options.relativeTo, Path.dirname(filename)),
                file: Path.basename(filename),
                size: stat.size,
                lastUpdated: stat.mtime
            };

            if (!options.recursive) {
                file.isDirectory = stat.isDirectory()
            } else {
                file.isDirectory = false;
            }

            results.push(file);
        }
    });

    return results;
};

exports.sync = ls;

/*console.log(JSON.stringify(ls('/home/zyn/Projects/elearning/app' , {
    recursive: true,
    relativeTo: '/home/zyn/Projects/elearning'
}), null, 4));*/
