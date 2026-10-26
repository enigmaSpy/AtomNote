import type { Status } from "@shared/domain/types";
import { isEexist, isEnotEmpty, notPermitted } from "@shared/utils/warning";
import { rename } from "node:fs/promises";
import { join } from "node:path";

export async function renameAtom(rootPath: string, oldAtomName:string, newAtomName:string):Promise<Status>{
    try {
        await rename(join(rootPath, oldAtomName), join(rootPath, newAtomName));
        return {status: 'ok'}
    } catch (error) {
        if(isEexist(error) || isEnotEmpty(error)){
            return {status:'error', message: 'Atom już istnieje'}
        }else if(notPermitted(error)) return {status: 'error', message: 'OS nie pozwolił wykonać tej operacji'}
        return {status:'error', message: (error as Error).message}
    }
}