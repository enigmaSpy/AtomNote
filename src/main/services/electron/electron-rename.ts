import { renameFile } from "@main/utils/file";
import { readJsonWithSchema, writeJsonWithSchema } from "@main/utils/json";
import type { Status } from "@shared/domain/types";
import { ElectronsDiscSchema, type ElectronsMetaDisc } from "@shared/schemas/electron";
import type { ElectronId } from "@shared/schemas/ids";
import { join } from "path";

export async function renameElectron(
    rootPath: string,
    atomName: string,
    electronId: ElectronId,
    newElectronName: string
): Promise<Status<string>> {

    const atomPath = join(rootPath, atomName);
    const electronMetaPath = join(atomPath,'.atom_data','electrons.json');
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
        status:'error', 
        code: 'ERR_ELECTRON_READ_FAILED',
    }
    const electronMeta = readResult.data[electronId];

    if (!electronMeta) {
        return {
            status: 'error',
            code: 'ERR_ELECTRON_META_NOT_FOUND',
            details: `${atomPath}- ${electronId}`
        };
    }

    const oldElectronFileName = electronMeta.filename;

    const newElectronFileName = newElectronName.endsWith('.md')? newElectronName: `${newElectronName}.md`;

    if (oldElectronFileName === newElectronFileName) {
        return { status: 'ok', data: newElectronFileName};
    }

    const renameResult = await renameFile(atomPath, oldElectronFileName,newElectronFileName);

    if (renameResult.status !== 'ok') {
        return renameResult;
    }

    const newData: ElectronsMetaDisc = {
        ...readResult.data,
        [electronId]: {
            ...electronMeta,
            filename: newElectronFileName,
            updatedAt: new Date().toISOString()
        }
    };

    const writeResult = await writeJsonWithSchema(
        electronMetaPath,
        ElectronsDiscSchema,
        newData
    );

    if (writeResult.status !== 'ok') {

        const rollbackResult = await renameFile(
            atomPath,
            oldElectronFileName,
            newElectronFileName
        );

        if (rollbackResult.status !== 'ok') {
            return rollbackResult
        }
        return {
            status: 'error',
            code: 'ERR_ELECTRON_RENAME_FAILED'
        };
    }
    return { status: 'ok', data: newElectronFileName };
}