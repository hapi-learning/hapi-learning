'use strict';

const Fs   = require('fs');
const Glob = require('glob');
const Path = require('path');
const Hoek = require('hoek');

const internals = {
    defaults: {
        recursive: false,
        nodir: false
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
            results.push({ [Path.basename(filename)]: ls(filename, options) });
        } else {
             const file = {
                dir: Path.dirname(filename),
                full: filename,
                file: Path.basename(filename),
                name: Path.basename(filename, Path.extname(filename)),
                size: stat.size,
                directory: stat.isDirectory()
            };

            results.push(file);
        }
    });

    return results;
};

exports.sync = ls;
