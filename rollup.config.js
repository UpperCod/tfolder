import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import builtins from "builtin-modules";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

let nodePlugins = [resolve(), json(), commonjs()];

export default [
  {
    input: "src/cli.js",
    output: {
      file: "cli.js",
      format: "cjs",
      banner: "#!/usr/bin/env node",
      sourcemap: true,
    },
    external: builtins,
    plugins: [
      replace({
        "PKG.VERSION": pkg.version,
      }),
      ...nodePlugins,
      {
        name: "plugin-local",
        renderChunk(code) {
          return code.replace("commonjsRequire(file)", "require(file)");
        },
      },
    ],
  },
  {
    input: "src/utils.js",
    output: {
      file: "utils.js",
      format: "cjs",
      sourcemap: true,
    },
    external: builtins,
    plugins: nodePlugins,
  },
];
