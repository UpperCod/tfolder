declare module "template-folder" {
    export function mkdirpath(url:string,position?:number):Promise;
    export function replace(text:string,data:Object):string;
    export function template(source:string,dist:string,data?:Object):Promise;
}