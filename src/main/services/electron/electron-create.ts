import type { Status } from "@shared/domain/types";
import { ElectronsDictSchema, type ElectronMeta, type ElectronsMetaDict } from "@shared/schemas/electron";
import type { ElectronId } from "@shared/schemas/ids";
import { readJsonWithSchema, writeJsonWithSchema } from "@shared/utils/json";
import { isEexist, isEnotEmpty, isEperm } from "@shared/utils/warning";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { join } from "path";


export async function createElectron(rootPath:string, atomName:string, electronName:string):Promise<Status<ElectronsMetaDict>> {
    const electronId = randomUUID() as ElectronId;

    const atomPath = join(rootPath, atomName);

    const electronFilename = `${electronName}.md`;
    const electronPath = join(atomPath, electronFilename);

    const electronMetaPath = join(atomPath, '.atom_data', 'electrons.json');

    const now = new Date().toISOString();

    const electronMeta: ElectronMeta={
        filename: electronFilename,
        tags: new Set<string>(),
        mastery: 0,
        createdAt: now,
        updatedAt: now 
    }
    
    const readResult = await readJsonWithSchema(electronMetaPath, ElectronsDictSchema);
    if(readResult.status !== 'ok'){
        return {status: 'error', message:readResult.status}
    }
    
    try{
        await writeFile(electronPath,"", {flag:"wx"});
    }catch(error){
        if(isEexist(error) || isEnotEmpty(error)){
            return {status:'error', message: 'Elektron już istnieje'}
        }else if(isEperm(error)) return {status: 'error', message: 'OS nie pozwolił wykonać tej operacji'}
        return {status:'error', message: (error as Error).message}
    }
    
    const updatedElectrons:ElectronsMetaDict = {
        ...readResult.data,
        [electronId]:electronMeta
    }
    const writeResult = await writeJsonWithSchema(electronMetaPath, ElectronsDictSchema, updatedElectrons);
    if(writeResult.status !== 'ok'){
        return {status: 'error', message:readResult.status}
    }
    return {status: 'ok', data: {[electronId]: electronMeta}}
}



