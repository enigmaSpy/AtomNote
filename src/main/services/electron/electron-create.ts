import { readJsonWithSchema, writeJsonWithSchema } from "@main/utils/json";
import type { Status } from "@shared/domain/types";
import { ElectronsDiscSchema, type ElectronMeta, type ElectronsMetaDisc } from "@shared/schemas/electron";
import type { ElectronId } from "@shared/schemas/ids";
import { isEexist, isEnotEmpty, isEperm } from "@shared/utils/warning";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { join } from "path";


export async function createElectron(rootPath:string, atomName:string, electronName:string):Promise<Status<ElectronsMetaDisc>> {
    const electronId = randomUUID() as ElectronId;

    const atomPath = join(rootPath, atomName);

    const electronFilename = `${electronName.trim()}.md`;
    const electronPath = join(atomPath, electronFilename);

    const electronMetaPath = join(atomPath, '.atom_data', 'electrons.json');

    const now = new Date().toISOString();

    const electronMeta: ElectronMeta={
        filename: electronFilename,
        tags: [],
        mastery: 0,
        createdAt: now,
        updatedAt: now 
    }
    
    const readResult = await readJsonWithSchema(electronMetaPath, ElectronsDiscSchema);
    if(readResult.status === 'not-found'){
        return {
            status: 'error', 
            code: 'ERR_ELECTRON_META_NOT_FOUND',
            details: `${electronMetaPath}`
        }
    }else if(readResult.status === 'invalid'){
        return {
            status: 'error', 
            code: 'ERR_ELECTRON_META_INVALID',
            details: `${electronMetaPath}`
        }
    }
    
    try{
        await writeFile(electronPath,"", {flag:"wx"});
    }catch(error){
        if(isEexist(error) || isEnotEmpty(error)){
            return {
                status:'error', 
                code: 'ERR_ELECTRON_ALREADY_EXISTS',
                details: `${electronFilename} exist in ${rootPath}`
            }
        }else if(isEperm(error)) return {
            status: 'error', 
            code: 'ERR_PERMISSION_DENIED',
            details: `operation denied on ${electronFilename}`
        }
        return {
            status:'error', 
            code: 'ERR_UNKNOWN',
            details: (error as Error).message
        }
    }
    
    const updatedElectrons:ElectronsMetaDisc = {
        ...readResult.data,
        [electronId]:electronMeta
    }
    const writeResult = await writeJsonWithSchema(electronMetaPath, ElectronsDiscSchema, updatedElectrons);
    if(writeResult.status !== 'ok'){
        return {
            status: 'error', 
            code: 'ERR_ELECTRON_WRITE_FAILED',
            details: 'failed to create electron meta'
        }
    }
    return {status: 'ok', data: {[electronId]: electronMeta}}
}



