import type { ElectronsDict } from "@shared/schemas/electron";
import { join } from "node:path";
import { readJsonWithSchema, writeJson } from "./json";
import type { WarningCollector } from "./warning";
import { ElectronsDictSchema } from "@shared/schemas/electron";

/**
 * Aktualizacja elektron.json o nowe metadane
 * 
 * @param atomPath ścieżka atomu
 * @param newData dane do dopisania do elektronu
 * @param collector kolektor ostrzeżeń strukturalnych
 */
export async function appendElectronDate(//TODO: adopcja przeniesiona na poziom atomu 
    atomPath: string,
    newData: ElectronsDict,
    collector: WarningCollector,
){
    const filePath = join(atomPath, '.atom_data', 'electron.json');
    const existing = await readJsonWithSchema(
        filePath,
        ElectronsDictSchema,
        collector
    );
    const updated = {
        ...(existing??{}),   
        ...newData     
    };
    
    await writeJson(updated, filePath, collector);
}