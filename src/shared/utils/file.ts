import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export function readFileApp(...segments:string[]):Promise<string>{
    const filePath = join(...segments);
    return readFile(filePath, {encoding:'utf-8'});
}

export async function writeFileApp(context: string,...segments:string[]):Promise<void>{
    
        const filePath = join(...segments);
        await mkdir(dirname(filePath), {recursive:true})
        await writeFile(filePath, context, {encoding: 'utf-8'});
}


export const deleteFileApp = async (...segments:string[])=>{
    const filePath = join(...segments);
    unlink(filePath);
}
