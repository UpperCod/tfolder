declare module "template-folder" {
    export function mkdirpath(dir:string,position?:number):Promise;
    export function removedir(dir:string):Promise;
    export function template(source:string,dist:string,data?:Object):Promise;
}