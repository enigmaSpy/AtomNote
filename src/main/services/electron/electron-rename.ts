import type { Status } from "@shared/domain/types";
import { ElectronsDictSchema, type ElectronsMetaDict } from "@shared/schemas/electron";
import type { ElectronId } from "@shared/schemas/ids";
import { renameFile } from "@shared/utils/file";
import { readJsonWithSchema, writeJsonWithSchema } from "@shared/utils/json";
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
        ElectronsDictSchema
    );

    if (readResult.status !== 'ok') {
        return {
            status: 'error',
            message: readResult.status
        };
    }
    if(!readResult.data) return {
        status:'error', 
        message: 'nie udało się pobrać electron.json'
    }
    const electronMeta = readResult.data[electronId];

    if (!electronMeta) {
        return {
            status: 'error',
            message: 'Nie znaleziono elektronu w electrons.json'
        };
    }

    const oldElectronFileName = electronMeta.filename;

    const newElectronFileName = newElectronName.endsWith('.md')? newElectronName: `${newElectronName}.md`;

    if (oldElectronFileName === newElectronFileName) {
        return { status: 'ok', data: newElectronFileName};
    }

    const renameResult = await renameFile(atomPath, oldElectronFileName,newElectronFileName,'Electron');

    if (renameResult.status !== 'ok') {
        return renameResult;
    }

    const newData: ElectronsMetaDict = {
        ...readResult.data,
        [electronId]: {
            ...electronMeta,
            filename: newElectronFileName,
            updatedAt: new Date().toISOString()
        }
    };

    const writeResult = await writeJsonWithSchema(
        electronMetaPath,
        ElectronsDictSchema,
        newData
    );

    if (writeResult.status !== 'ok') {

        const rollbackResult = await renameFile(
            atomPath,
            oldElectronFileName,
            newElectronFileName,
            'Electron'
        );

        if (rollbackResult.status !== 'ok') {
            return {
                status: 'error',
                message: `Nie zapisano metadata i nie udało się przywrócić nazwy pliku: ${rollbackResult.message}`
            };
        }
        return {
            status: 'error',
            message: writeResult.status
        };
    }
    return { status: 'ok', data: newElectronFileName };
}