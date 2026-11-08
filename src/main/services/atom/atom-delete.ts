import type { Status } from "@shared/domain/types";
import { isEnoent } from "@shared/utils/warning";
import { rm } from "node:fs/promises";
import { join } from "node:path";

export async function deleteAtom(rootPath: string, name: string):Promise<Status>{
    const path =join(rootPath, name)
    try {
        await rm(path, {recursive: true})
    } catch (error) {
        if(isEnoent(error)){
            return {status: 'error',code: 'ERR_PATH_NOT_FOUND' ,details: `${path} - delete Atom failed`}
        }
        return {status: 'error',code: 'ERR_ATOM_INVALID' ,details: (error as Error).message}
    }
    return {status: 'ok'}
}