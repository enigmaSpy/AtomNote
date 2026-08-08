import { calculateElectronMastery } from "@main/services/electron/electron-mastery";
import type { ElectronNote } from "@shared/domain/types";
import type { ElectronsDict } from "@shared/schemas/electron";
import { getFileData } from "@shared/utils/path";
import type { WarningCollector } from "@shared/utils/warning";
import { randomUUID } from "node:crypto";
import type { Dirent } from "node:fs";
import { join } from "node:path";

export interface ElectronParseResult{
    electron: ElectronNote,
    newMetaEntry: ElectronsDict | null
}
/**
 * Parsuje elektron, zarządza metadanymi elektrónów
 * 
 * @param child obiekt katalogu
 * @param atomId id Atomu
 * @param electronsDict słownik elektronów
 * @param collector kolektor ostrzeżeń strukturalnych
 * @returns obietnice, która zwraca sparsowany elektron albo null gdy katalok jest neiczytelny
 */
export async function electronParse(
    child: Dirent, 
    atomId: string, 
    electronsDict: ElectronsDict|null,
    collector: WarningCollector
):Promise<ElectronParseResult|null>{

    const { ext } = getFileData(child.name)
    
    if (ext !== "txt" && ext !== "md") {
        collector.pushWarning(
            join(child.parentPath, child.name),
                'unexpected-file',
                `Plik "${child.name}" ma nieobsługiwane rozszerzenie .${ext} i został zignorowany.`
            )
        return null;
    }

    const entry = Object.entries(electronsDict ?? {}).find(
        ([_, meta]) => {
            return meta.filename === child.name
        }
    )
    let currentElectronId: string;
    let meta = entry?entry[1]:null;
    let newMetaEntry: ElectronsDict|null = null;
    if(entry){
        currentElectronId = entry[0]
    }else{
        currentElectronId = randomUUID()
        const newMeta = {
            filename: child.name,
            tags: [],
            covalentAtomIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        meta = newMeta;
        newMetaEntry = {
            [currentElectronId]: newMeta
        }
    }
    const electronMastery = await calculateElectronMastery(currentElectronId, child.parentPath);
    return{
        electron:{
            id: currentElectronId,
            atomId,
            filename: child.name,
            tags: meta?.tags??[],
            covalentAtomIds: meta?.covalentAtomIds ?? [],
            mastery: electronMastery,
            createdAt: meta?.createdAt ?? new Date().toISOString(),
            updatedAt: meta?.updatedAt ?? ""
        },
        newMetaEntry
    }
}