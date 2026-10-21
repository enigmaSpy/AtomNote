import type { Status } from "@shared/domain/types";
import { isEexist, IsEnotEmpty } from "@shared/utils/warning";
import { rename } from "node:fs/promises";
import { join } from "node:path";

export async function renameAtom(rootPath: string, oldAtomName:string, newAtomName:string):Promise<Status>{
    try {
        await rename(join(rootPath, oldAtomName), join(rootPath, newAtomName));
        return {status: 'ok'}
    } catch (error) {
        if(isEexist(error) || IsEnotEmpty(error)){
            return {status:'error', message: 'Atom już istnieje'}
        }
        return {status:'error', message: (error as Error).message}
    }
}