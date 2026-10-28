import type { Status } from "@shared/domain/types";
import { renameFile } from "@shared/utils/file";

export async function renameAtom(rootPath: string, oldAtomName:string, newAtomName:string):Promise<Status>{
    const renameStatus = await renameFile(rootPath, oldAtomName,newAtomName, 'Atom');
    return renameStatus;
}