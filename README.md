# tfolder

![tfolder](https://res.cloudinary.com/dz0i8dmpt/image/upload/v1580658927/github/tfolder/carbon_1.png)

With tfolder you can copy the contents of a directory A to B with the advantage that the directory name and content of the files are processed by mustache, this with the idea of creating directories as a template,eg:

```bash
tfolder ./a ./b --data {"name":"custom-name"}

./a/
   {{name}}/
      file-{{name}}.md
./b/
   custom-name/
      file-custom-name.md
```

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

tfolder.config allows to intercept the configuration to be modified when executing the function of this file

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

**In the previous example by using [prompts](https://www.npmjs.com/package/prompts), included by default, you can add fields to use by your template.
This file should only be in the main directory of the template**

## Example of use

[Template directory for atomicojs/base](https://github.com/atomicojs/base/tree/create-webcomponents-with-bundle-cli/template/tfolder/component), in it you can see how to create a template for the generation of components.
