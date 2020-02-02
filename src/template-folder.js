import { join, parse } from "path";
import { promises } from "fs";
import ems from "esm";
import mustache from "mustache";
import textextensions from "textextensions";

const templateFolder = "template.config.js";
const requireEms = ems(module);
const cwd = process.cwd();

const { readdir, mkdir, stat, copyFile, readFile, writeFile } = promises;

export default async function template(dir, dest, { data, force }, deep = 0) {
  try {
    let absoluteDir = join(cwd, dir);

    if (!deep) {
      data = {
        ...data,
        ...(await loadTemplateConfig(join(absoluteDir, templateFolder), data))
      };

      dest = data.dest || dest;
    }

    let absoluteDest = join(cwd, dest);

    let [listDir] = await asyncMap(
      readdir(absoluteDir),
      prepareDest(absoluteDest)
    );

    listDir.map(async subDir => {
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
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadTemplateConfig(file, data) {
  try {
    let md = requireEms(file);
    return Promise.resolve(md.default(data));
  } catch (e) {}
}

async function prepareDest(dest) {
  try {
    await stat(dest);
  } catch (e) {
    await mkdir(dest, {
      recursive: true
    });
  }
}

function asyncMap(...args) {
  return Promise.all(args);
}
