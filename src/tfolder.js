import { join, parse } from "path";
import { promises } from "fs";
import ems from "esm";
import mustache from "mustache";
import textextensions from "textextensions";

const templateFolder = "tfolder.config.js";
const requireEms = ems(module);
const cwd = process.cwd();

const { readdir, mkdir, stat, copyFile, readFile, writeFile } = promises;
/**
 * This cli allows you to copy an A to B, with the advantage
 * that in time copy generates dynamic changes
 * @param {string} dir - origin of the copy
 * @param {string} dest - copy destination
 * @param {{data:Object,force:boolean}} config
 * @param {number} deep - internal, directory depth
 * @returns {Promise}
 */
export default async function template(
  dir,
  dest,
  { data, force } = {},
  deep = 0
) {
  try {
    let absoluteDir = join(cwd, dir);

    if (!deep) {
      data = {
        ...data,
        ...(await loadTemplateConfig(join(absoluteDir, templateFolder), data))
      };
      // allows you to add a new destination over the one already defined
      dest = data.dest ? join(dest, data.dest) : dest;
      // If defined, it allows redirecting the copy into the same folder
      if (data.dir) {
        dir = join(dir, data.dir);
        absoluteDir = join(cwd, dir);
      }
    }

    let absoluteDest = join(cwd, dest);

    // run the tasks in parallel
    let [listDir] = await asyncMap(
      readdir(absoluteDir),
      prepareDest(absoluteDest)
    );
    // run the tasks in parallel
    return asyncMap(
      ...listDir.map(async subDir => {
        if (templateFolder == subDir) return;
        let nextDest = join(dest, mustache.render(subDir, data));
        let nextDir = join(dir, subDir);

        let [statDir, statDest] = await asyncMap(
          stat(nextDir),
          stat(nextDest).catch(() => null)
        );

        if (statDir.isDirectory()) {
          return template(nextDir, nextDest, { data, force }, deep + 1);
        }
        if ((!statDest || force) && statDir.isFile()) {
          let { ext, name } = parse(nextDest);
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
