import { calculateElectronMastery } from "@main/services/electron/electron-mastery";
import type { ElectronNote } from "@shared/domain/types";
import type { ElectronMeta } from "@shared/schemas/electron";
import { getFileData } from "@shared/utils/path";
import type { WarningCollector } from "@shared/utils/warning";
import type { Dirent } from "node:fs";
import { join } from "node:path";

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
    electronId: string,
    meta: ElectronMeta,
    collector: WarningCollector
):Promise<ElectronNote|null>{

    const { ext } = getFileData(child.name)
    
    if (ext !== "txt" && ext !== "md") {
        collector.pushWarning(
            join(child.parentPath, child.name),
                'unexpected-file',
                `Plik "${child.name}" ma nieobsługiwane rozszerzenie .${ext} i został zignorowany.`
            )
        return null;
    }
    const electronMastery = await calculateElectronMastery(electronId, child.parentPath);
    return{
        id: electronId,
        atomId,
        filename: child.name,
        tags: meta.tags,
        covalentAtomIds: meta.covalentAtomIds,
        mastery: Number(electronMastery.toFixed(2)),
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt
    }
    
}