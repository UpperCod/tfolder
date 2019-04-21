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
const copy = promisify(fs.copyFile);
const mustache = require("mustache");
const format = "utf8";

const binaryExtensions = [
	/.(ico|jpeg|jpg|png|gif|webp)$/,
	/.(eot|ttf|woff|otf)$/,
	/.(pdf)$/,
	/.(swf|mp4|webm|ogg|mp3|wap)$/,
	/.(zip|raw|iso)$/
];

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
						insert = mustache.render(path.join(dist, child), data);

					return lstat(master).then(stat => {
						if (stat.isDirectory()) {
							return template(master, insert, data);
						}
						if (stat.isFile()) {
							return readfile(master, format).then(text => {
								let isBinary = binaryExtensions.some(reg => reg.test(master));

								let create = () =>
									isBinary
										? copy(master, insert)
										: write(insert, mustache.render(text, data), format);

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
	binaryExtensions,
	mkdirpath,
	removedir,
	template,
	mustache
};
