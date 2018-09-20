# template-folder

Este script permite generar plantillas de carpeta, sea por ejemplo pasar el contenido de la carpeta A a la carpeta B, pero leyendo los ficheros y directorios individualmente, este script no rompe el estado actual de la carpeta de destino, solo añade los ficheros inexistentes en el directorio.

A su vez gracias al uso del 3 argumento ud podrá pasar información dinámica a los documentos de lectura.

## Ejemplo

El siguiente ejemplo pasará el contenido existente en la carpeta `./template` a la carpeta `./copy`
```js
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

## replace

Mediante el uso del comodín de plantilla `{{name_property}}`,  ud podrá imprimir la información en el destino.

### Ejemplo en ficheros
```
{{name}}.md
```
Si data fuera `{name:"hello"}` el fichero impreso sera `hello.md`, esto sucede de igual forma con el contenido de los ficheros.

Si la propiedad a buscar no se encuentra en data no se generará reemplazo.


