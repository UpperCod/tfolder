#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sade = _interopDefault(require('sade'));
var path = require('path');
var fs = require('fs');
var ems = _interopDefault(require('esm'));
var mustache = _interopDefault(require('mustache'));
var textextensions = _interopDefault(require('textextensions'));

const templateFolder = "tfolder.config.js";
const requireEms = ems(module);
const cwd = process.cwd();

const { readdir, mkdir, stat, copyFile, readFile, writeFile } = fs.promises;
/**
 * This cli allows you to copy an A to B, with the advantage
 * that in time copy generates dynamic changes
 * @param {string} dir - origin of the copy
 * @param {string} dest - copy destination
 * @param {{data:Object,force:boolean}} config
 * @param {number} deep - internal, directory depth
 * @returns {Promise}
 */
async function template(
  dir,
  dest,
  { data, force } = {},
  deep = 0
) {
  try {
    let absoluteDir = path.join(cwd, dir);

    if (!deep) {
      data = {
        ...data,
        ...(await loadTemplateConfig(path.join(absoluteDir, templateFolder), data))
      };
      // allows you to add a new destination over the one already defined
      dest = data.dest ? path.join(dest, data.dest) : dest;
      // If defined, it allows redirecting the copy into the same folder
      if (data.dir) {
        dir = path.join(dir, data.dir);
        absoluteDir = path.join(cwd, dir);
      }
    }

    let absoluteDest = path.join(cwd, dest);

    // run the tasks in parallel
    let [listDir] = await asyncMap(
      readdir(absoluteDir),
      prepareDest(absoluteDest)
    );
    // run the tasks in parallel
    return asyncMap(
      ...listDir.map(async subDir => {
        if (templateFolder == subDir) return;
        let nextDest = path.join(dest, mustache.render(subDir, data));
        let nextDir = path.join(dir, subDir);

        let [statDir, statDest] = await asyncMap(
          stat(nextDir),
          stat(nextDest).catch(() => null)
        );

        if (statDir.isDirectory()) {
          return template(nextDir, nextDest, { data, force }, deep + 1);
        }
        if ((!statDest || force) && statDir.isFile()) {
          let { ext, name } = path.parse(nextDest);
          let type = (ext || name).replace(".", "");
          if (textextensions.includes(type)) {
            let content = await readFile(nextDir, "utf8");
            return writeFile(nextDest, mustache.render(content, data), "utf8");
          } else {
            return copyFile(nextDir, nextDest);
          }
        }
      })
    );
  } catch (e) {
    console.error(e);
  }
}
/**
 * It allows to obtain and execute the local configuration file `tfolder.config.js`
 * @param {string} file - file to run
 * @param {object} data - information to be delivered to the archive function
 * @returns {Promise<Object>|null}
 */
async function loadTemplateConfig(file, data) {
  try {
    let md = requireEms(file);
    return Promise.resolve(md.default(data));
  } catch (e) {}
}

/**
 * Prepare a directory, checking if it already exists or creating it.
 * @param {string} dest - directory to prepare
 * @returns {Promise}
 */
async function prepareDest(dest) {
  try {
    await stat(dest);
  } catch (e) {
    await mkdir(dest, {
      recursive: true
    });
  }
}
/**
 *
 * @param  {...Promise[]} args
 * @returns {Promise<any[]>}
 */
function asyncMap(...args) {
  return Promise.all(args);
}

sade("tfolder <src> <dest>")
  .version("0.1.0")
  .option("-f, --force", "force writing of existing files", false)
  .option(
    "-d, --data",
    "allows you to enter data to share with the json format template",
    "{}"
  )
  .example("tfolder ./a ./b")
  .example("tfolder ./a ./b -f")
  .example('tfolder ./a ./b -f -d "{\\"name\\":\\"...data\\"}"')
  .action(async (src, dest = "dist", { data, force }) => {
    await template(src, dest, { data: JSON.parse(data), force });
    console.log(`successful copy, check directory \`${dest}\``);
  })
  .parse(process.argv);
