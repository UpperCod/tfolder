# template-folder

This script allows you to generate folder templates, for example to pass the contents of folder A to folder B, but reading the files and directories individually, this script does not break the current state of the destination folder, it only adds the nonexistent files in the directory.

In turn, thanks to the use of the 3 argument you can pass dynamic information to the reading documents.


## function template( url:string, url:string [, data = {}]):Promise

The following example will pass the existing content in the `./template` folder to the `./copy` folder.

```js
const {template,mkdirpath,replace} = require("template-folder");

template(
   path.resolve(__dirname, "./template"),
   path.resolve(__dirname, "./copy"),
   {
       name: "template-folder"
   }
).then(() => {
   console.log("ready!");
});
```

## function replace( text:string, data: Object ):string

Using the template wildcard `{{name property}}`, you can print the information to the destination.

## function mkdirpath( url:string ):Promise

creates a directory path recursively, does not destroy existing content

### Example

```
{{name}}.md
```
If data were `{name:"hello"}` the printed file will be `hello.md`, this happens in the same way with the contents of the files.

If the property to be searched is not found in data, replacement will not be generated.


