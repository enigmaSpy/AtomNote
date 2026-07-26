import type { ElectronsDict } from "@shared/schemas/electron";
import { join } from "node:path";
import { readJsonWithSchema, writeJson } from "./json";
import type { WarningCollector } from "./warning";
import { ElectronsDictSchema } from "@shared/schemas/electron";

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