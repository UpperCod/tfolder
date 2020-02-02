# tfolder

![tfolder](https://res.cloudinary.com/dz0i8dmpt/image/upload/v1580658927/github/tfolder/carbon_1.png)

This package is a CLI, which allows you to copy the contents of a directory A to a directory B, with the great difference that tempalte-folder allows you to manipulate the content to be copied as you generate the reading, this with the idea that the generation is dynamic, eg:

```bash
tfolder ./a ./b --data {"name":"custom-name"}

./a/
   {{name}}/
      file-{{name}}.md
./b/
   custom-name/
      file-custom-name.md
```

The template system defined for this process is mustache

## Installation

```bash
npm install -D tfolder-cli
```

## usage

It is recommended that you attach it locally to associate it with the scripts of your package.json, eg:

```json
{
  "scripts": {
    "create-component": "tfolder ./create-component ./src/components"
  }
}
```

## Flags

- **-f, --force**: force the replacement of the files if they already exist
- **-d, --data**: define a json object to share with tfolder.config.js
- **-h, --help**: Show cli information

## tfolder.config.js

It allows to extend the behavior of tfolder, by means of a function capable of modifying the variable data shared with the template, by default tempalte-folder couples the package [prompts](https://www.npmjs.com/package/prompts) to improve the experience of data generation through the terminal, eg:

```js
import prompts from "prompts";

const questions = [
  {
    type: "text",
    name: "title",
    message: "What is your GitHub username?"
  }
];

export default function() {
  return prompts(questions);
}
```

**This file should only be in the main directory of the template**

## Example of use

[Template directory for atomicojs/base](https://github.com/atomicojs/base/tree/create-webcomponents-with-bundle-cli/template/tfolder/component), in it you can see how to create a template for the generation of components.
