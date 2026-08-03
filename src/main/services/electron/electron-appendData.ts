import type { ElectronsDict } from "@shared/schemas/electron";
import { ElectronsDictSchema } from "@shared/schemas/electron";
import { join } from "node:path";
import { readJsonWithSchema, writeJson } from "../../../shared/utils/json";
import type { WarningCollector } from "../../../shared/utils/warning";

/**
 * Aktualizacja elektron.json o nowe metadane
 * 
 * @param atomPath ścieżka atomu
 * @param newData dane do dopisania do elektronu
 * @param collector kolektor ostrzeżeń strukturalnych
 */
export async function appendElectronData(
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
    
    await writeJson(filePath, updated,  collector);
}