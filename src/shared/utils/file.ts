import { readFile } from "node:fs/promises";
import { join } from "node:path";

export function readFileApp(...segments:string[]){
    const filePath = join(...segments);
    return readFile(filePath, {encoding:'utf-8'});
}