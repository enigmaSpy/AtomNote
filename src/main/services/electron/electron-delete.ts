import type { Status } from "@shared/domain/types";
import { ElectronsDictSchema } from "@shared/schemas/electron";
import type { ElectronId } from "@shared/schemas/ids";
import { readJsonWithSchema, writeJsonWithSchema } from "@shared/utils/json";
import { isEacces, isEbusy, isEnoent, isEperm  } from "@shared/utils/warning";
import { rm } from "fs/promises";
import { join } from "path";

export async function deleteElectron(rootPath: string, atomName:string, electronId:ElectronId):Promise<Status>{
    const atomPath = join(rootPath, atomName);
    const electronMetaPath = join(atomPath, '.atom_data', 'electrons.json')
    const readResult = await readJsonWithSchema(
        electronMetaPath,
        ElectronsDictSchema
    );
    if(readResult.status !== 'ok') return {
        status: 'error',
        message: readResult.status
    }
    if(!readResult.data) return {
        status: 'error',
        message: 'Bral elektronów do usunięcia'
    }
    const {[electronId]: targetElectron, ...updatedElectrons} = readResult.data;
    if (!targetElectron) {
        return {
            status: 'error',
            message: 'Elektron nie istnieje w metadanych'
        };
    }
    const writeResult = await writeJsonWithSchema(
        electronMetaPath,
        ElectronsDictSchema,
        updatedElectrons
    );
    if(writeResult.status !== 'ok') return {
        status: 'error',
        message: `Nie udało się usunąć Elektronu: ${writeResult.status}`
    }
    try {        
        const filename = targetElectron.filename;
        await rm(join(atomPath, filename))
    } catch (error) {
        let status: Status;
        if (isEnoent(error)) {
            status = {
                status: 'error',
                message: "Elektron nie istnieje"
            };
        } else if (isEperm(error)) {
            status = {
                status: 'error',
                message: "OS nie pozwala na wykonanie operacji"
            };
        } else if (isEbusy(error)) {
            status = {
                status: 'error',
                message: 'Plik jest aktualnie otwarty i nie może zostać usunięty'
            };
        } else if (isEacces(error)) {
            status = {
                status: 'error',
                message: 'Brak uprawnień do katalogu nadrzędnego'
            };
        } else {
            status = {
                status: 'error',
                message: (error as Error).message
            };
        }
        const rollbackResult = await writeJsonWithSchema(
            electronMetaPath,
            ElectronsDictSchema,
            readResult.data
        );
        if(rollbackResult.status !== "ok"){
            status = {
                status: 'error',
                message:"Metadane został wyczyszczone, ale plik nie został usunięty. Uruchom ponownie AtomNote"
            }
        }
        return status;
    }
    
    return {status: 'ok'}
}