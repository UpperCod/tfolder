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
const mustache = require("mustache");
const format = "utf8";

mustache.tags = ["::", "::"];

/**
 * Create a directory recursively
 * @param {string} dir
 * @param {number} [position]
 * @return {Promise}
 */
function mkdirpath(dir, position = 1) {
	dir = Array.isArray(dir) ? dir : dir.split(/(?:\/|\\)/);
	let max = dir.length,
		use = dir.slice(0, position).join("/");
	return lstat(use)
		.catch(() => mkdir(use, 0777))
		.then(() => (max > position ? mkdirpath(dir, position + 1) : true));
}
/**
 * Get an index of an object based on a string map `name.item [0]`
 * @param {object} value
 * @param {string} attr
 * @param {any} option
 * @return {string}
 */
function getAttr(value = {}, attr) {
	attr = attr.match(/[^\[\]\.]+/g) || [];
	for (let i = 0; i < attr.length; i++) {
		if (typeof value === "object" && attr[i] in value) {
			value = value[attr[i]];
		} else {
			return "";
		}
	}
	return value != null ? value : "";
}
/**
 * obtains from the string the pattern `{{.*}}`,
 * to fill with the value extracted from the object
 * @param {object} text
 * @param {string} data
 */
function replace(text, data) {
	return text.replace(/{{\s*([^{}]+)\s*}}/g, (all, prop) =>
		getAttr(data, prop)
	);
}
/**
 * copy the source directory in dist, and fill
 * in the information based on the loaded data
 * @param {string} source
 * @param {string} dist
 * @param {object} data
 * @returns {Promise}
 */
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
								.then(text => mustache.render(text, data))
								.then(text => {
									let create = () => write(insert, text, format);
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
/**
 * copy the source directory in dist, and fill
 * in the information based on the loaded data
 * @param {string} dir
 * @return {Promise}
 */
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
/**
 * @module template-folder
 * @property {Function} mkdirpath
 * @property {Function} removedir
 * @property {Function} template
 */
module.exports = {
	mkdirpath,
	removedir,
	template
};
