import { readJsonWithSchema, writeJsonWithSchema } from "@main/utils/json";
import type { Status } from "@shared/domain/types";
import { ElectronsDiscSchema } from "@shared/schemas/electron";
import type { ElectronId } from "@shared/schemas/ids";
import { isEacces, isEbusy, isEnoent, isEperm } from "@shared/utils/warning";
import { rm } from "fs/promises";
import { join } from "path";

export async function deleteElectron(rootPath: string, atomName:string, electronId:ElectronId):Promise<Status<string[]>>{//TODO: Zwrócić aktualną tablicę tagów
    const atomPath = join(rootPath, atomName);
    const electronMetaPath = join(atomPath, '.atom_data', 'electrons.json')
    const readResult = await readJsonWithSchema(
        electronMetaPath,
        ElectronsDiscSchema
    );
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
    if(!readResult.data) return {
        status: 'error',
        code: 'ERR_ELECTRON_DELETE_FAILED'
    }
    const targetElectron = readResult.data[electronId];
    if (!targetElectron) {
        return {
            status: 'error',
            code: 'ERR_ELECTRON_META_NOT_FOUND',
            details: `electron not exists in electrons.json - ${electronMetaPath}`
        };
    }
    const electronsDict = readResult.data;
    const updatedElectrons = {electronsDict};
    delete updatedElectrons[electronId];
    const writeResult = await writeJsonWithSchema(
        electronMetaPath,
        ElectronsDiscSchema,
        updatedElectrons
    );
    if(writeResult.status === 'write-failed') return {
        status: 'error',
        code: 'ERR_ELECTRON_DELETE_FAILED',
        details: `Cannot delete electron | ID: ${electronId}`
    }
    try {        
        const filename = targetElectron.filename;
        await rm(join(atomPath, filename))
    } catch (error) {
        let status: Status;
        if (isEnoent(error)) {
            status = {
                status: 'error',
                code: 'ERR_ELECTRON_NOT_FOUND',
                details: `${atomPath} - ${electronId}`
            };
        } else if (isEperm(error)) {
            status = {
                status: 'error',
                code: 'ERR_PERMISSION_DENIED',
                details: 'operation denied'
            };
        } else if (isEbusy(error)) {
            status = {
                status: 'error',
                code: 'ERR_FILE_BUSY',
                details: 'current file is open'
            };
        } else if (isEacces(error)) {
            status = {
                status: 'error',
                code:'ERR_ELECTRON_PARENT_ACCESS_DENIED',
                details: `${atomPath}`
            };
        } else {
            status = {
                status: 'error',
                code: 'ERR_UNKNOWN',
                details: (error as Error).message
            };
        }
        const rollbackResult = await writeJsonWithSchema(
            electronMetaPath,
            ElectronsDiscSchema,
            electronsDict
        );
        if(rollbackResult.status !== "ok"){
            status = {
                status: 'error',
                code: 'ERR_WRITE_FAILED',
                details: `${atomPath} - ${rollbackResult.status}`
            }
        }
        return status;
    }
    const atomTags = [...new Set(Object.values(electronsDict).flatMap(({tags})=>tags))];
    return {status: 'ok', data: atomTags}
}