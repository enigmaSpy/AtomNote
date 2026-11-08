import { renameFile } from "@main/utils/file";
import type { Status } from "@shared/domain/types";

export async function renameAtom(rootPath: string, oldAtomName:string, newAtomName:string):Promise<Status>{
    const renameStatus = await renameFile(rootPath, oldAtomName,newAtomName);
    return renameStatus;
}