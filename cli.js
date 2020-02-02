#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sade = _interopDefault(require('sade'));
var path = require('path');
var fs = require('fs');
var ems = _interopDefault(require('esm'));
var mustache = _interopDefault(require('mustache'));
var textextensions = _interopDefault(require('textextensions'));

const templateFolder = "template.config.js";
const requireEms = ems(module);
const cwd = process.cwd();

const { readdir, mkdir, stat, copyFile, readFile, writeFile } = fs.promises;

async function template(dir, dest, { data, force }, deep = 0) {
  try {
    let absoluteDir = path.join(cwd, dir);

    if (!deep) {
      data = {
        ...data,
        ...(await loadTemplateConfig(path.join(absoluteDir, templateFolder), data))
      };

      dest = data.dest || dest;
    }

    let absoluteDest = path.join(cwd, dest);

    let [listDir] = await asyncMap(
      readdir(absoluteDir),
      prepareDest(absoluteDest)
    );

    listDir.map(async subDir => {
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

sade("template-folder [src] [dest]")
  .version("2.0.0")
  .option("-f, --force", "force writing of existing files", false)
  .option(
    "-d, --data",
    "allows you to enter data to share with the json format template",
    "{}"
  )
  .example("template-folder ./a ./b")
  .example("template-folder ./a ./b -f")
  .example('template-folder ./a ./b -f -d "{"name":"ea"}"')
  .example("")
  .action(async (src, dest = "dist", { data, force }) => {
    await template(src, dest, { data: JSON.parse(data), force });
    console.log(`successful copy, check directory \`${dest}\``);
  })
  .parse(process.argv);
