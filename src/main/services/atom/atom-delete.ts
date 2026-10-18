import type { Status } from "@shared/domain/types";
import { isEnoent } from "@shared/utils/warning";
import { rm } from "node:fs/promises";
import { join } from "node:path";

export async function deleteAtom(rootPath: string, name: string):Promise<Status>{

    try {
        await rm(join(rootPath, name), {recursive: true})
    } catch (error) {
        if(isEnoent(error)){
            return {status: 'error', message: 'Błędna ścieżka Atomu'}
        }
        return {status: 'error', message: (error as Error).message}
    }
    return {status: 'ok'}
}