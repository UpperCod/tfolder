const fs = require("fs");
const { promisify } = require("util");
const path = require("path");

const readfile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const mkdir = promisify(fs.mkdir);
const write = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const format = "utf8";

function mkdirpath(dir, position = 1) {
    dir = Array.isArray(dir) ? dir : dir.split(/(?:\/|\\)/);
    let max = dir.length,
        use = dir.slice(0, position).join("/");
    return lstat(use)
        .catch(() => mkdir(use, 0777))
        .then(() => (max > position ? mkdirpath(dir, position + 1) : true));
}

function replace(text, data) {
    return text.replace(
        /{{(?:\s){0,1}([^\}]+)(?:\s){0,1}}}/g,
        (all, prop) => (prop in data ? data[prop] : all)
    );
}

function template(source, dist, data = {}) {
    return mkdirpath(dist).then(() =>
        readdir(source).then(dirs =>
            Promise.all(
                dirs.map(child => {
                    let master = path.join(source, child),
                        insert = replace(path.join(dist, child), data);
                    return lstat(master).then(stat => {
                        if (stat.isDirectory()) {
                            return template(master, insert, data);
                        }
                        if (stat.isFile()) {
                            return readfile(master, format)
                                .then(text => replace(text, data))
                                .then(text => {
                                    let create = () =>
                                        write(insert, text, format);
                                    return lstat(insert)
                                        .then(stat => {
                                            if (stat.isDirectory()) {
                                                return create();
                                            }
                                        })
                                        .catch(create);
                                });
                        }
                    });
                })
            )
        )
    );
}

function removedir(dir) {
    return readdir(dir)
        .then(dirs =>
            Promise.all(
                dirs.map(child => {
                    let source = path.join(dir, child);
                    return lstat(source).then(stat => {
                        if (stat.isDirectory()) {
                            return removedir(source).then(() => rmdir(source));
                        }
                        if (stat.isFile()) {
                            return unlink(source);
                        }
                    });
                })
            )
        )
        .then(() => rmdir(dir));
}

module.exports = {
    mkdirpath,
    removedir,
    template,
    replace
};
