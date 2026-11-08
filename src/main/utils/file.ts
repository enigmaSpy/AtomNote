import type { Status } from "@shared/domain/types";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isEexist, isEnotEmpty, isEperm } from "../../shared/utils/warning";



export function readFileApp(...segments:string[]):Promise<string>{
    const filePath = join(...segments);
    return readFile(filePath, {encoding:'utf-8'});
}

export async function writeContentFile(context: string,...segments:string[]):Promise<void>{
    
    const filePath = join(...segments);
    await mkdir(dirname(filePath), {recursive:true})
    await writeFile(filePath, context, {encoding: 'utf-8'});
}

export async function renameFile(rootPath: string,oldName: string,newName: string):Promise<Status>{
    try {
        await rename(join(rootPath, oldName),join(rootPath, newName));
        return { status: 'ok' };
    } catch (error) {
        if (isEexist(error) || isEnotEmpty(error)) {
            return {
                status: 'error',
                code: 'ERR_ALREADY_EXISTS',
                details: `${newName} exists`
            };
        }
        if (isEperm(error)) {
            return {
                status: 'error',
                code:'ERR_PERMISSION_DENIED',
                details: `${oldName}`
            };
        }
        return {
            status: 'error',
            code:'ERR_UNKNOWN',
            details: (error as Error).message
        };
    }
};