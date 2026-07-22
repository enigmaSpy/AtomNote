//?loadOrAdoptWorldlineMeta

import type { WarningCollector } from "@shared/utils/warning";
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path";
const readJSON = async(path:string, collector:WarningCollector)=>{
    try {
        const data = await readFile(path, 'utf-8');
        return JSON.parse(data)
    } catch (error) {
        collector.pushWarning(path, 'unreadable', `Nie można odczytać pliku: ${(error as Error).message}`)
    }
}
export async function worldlineMeta(path: string, collector){
    const metaData = await readdir(path, {withFileTypes: true})
    for(const data of metaData){
        console.log(data);
        const dataPath = join(data.parentPath, data.name)
        const json = await readJSON(dataPath, collector)
        console.log(json);
        
    }
}