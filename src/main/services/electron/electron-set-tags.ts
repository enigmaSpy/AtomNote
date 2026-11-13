import { readJsonWithSchema, writeJsonWithSchema } from "@main/utils/json";
import type { Status, UpdateElectronTagsReturn } from "@shared/domain/types";
import { ElectronsDiscSchema } from "@shared/schemas/electron";
import type { ElectronId } from "@shared/schemas/ids";
import { join } from "path";

export async function setElectronTags(rootPath: string, atomName:string, electronId: ElectronId, tagNames: string[]):Promise<Status<UpdateElectronTagsReturn>>{
    const atomPath = join(rootPath, atomName);
    const filePath = join(atomPath, '.atom_data', 'electrons.json');

    const readResult = await readJsonWithSchema(filePath, ElectronsDiscSchema);
    if(readResult.status === 'invalid'){
        return {
            status: 'error',
            code: 'ERR_ELECTRON_META_INVALID',
            details: `${filePath} - ${electronId}`
        }
    }else if(readResult.status === 'not-found'){
        return {
            status: 'error',
            code: 'ERR_ELECTRON_META_NOT_FOUND',
            details: `${filePath} - ${electronId}`
        }
    }
    const electronsDict = readResult.data;
    if(!electronsDict[electronId]) return{
        status: 'error',
        code: 'ERR_ELECTRON_NOT_FOUND',
        details: `${filePath} - ${electronId}`
    }

    const clearTags = [...new Set(tagNames.map((tag)=>tag.trim().toLowerCase()))];
    const now = new Date().toISOString();
    electronsDict[electronId] = {
        ...electronsDict[electronId],
        tags: clearTags,
        updatedAt: now
    };

    const writeResult = await writeJsonWithSchema(filePath, ElectronsDiscSchema, electronsDict);
    if(writeResult.status === 'invalid'){
        return{
            status: 'error',
            code: 'ERR_TAG_WRITE_FAILED',
        }
    }else if(writeResult.status === 'write-failed'){
        return{
            status: 'error',
            code: 'ERR_ELECTRON_META_WRITE_FAILED',
        }
    }

    const atomTags = [...new Set(Object.values(electronsDict).flatMap(({tags})=>tags))];
    return {status: 'ok', data:{
        electronTags: clearTags,
        atomTags
    }}
}