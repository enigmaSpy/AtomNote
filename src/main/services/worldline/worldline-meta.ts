import { readJson } from "@shared/utils/json";
import type { WarningCollector } from "@shared/utils/warning";
import { readdir } from "node:fs/promises"
import { join } from "node:path";

export async function worldlineMeta(path: string, collector: WarningCollector):Promise<string|null>{
    const metaData = await readdir(path, {withFileTypes: true})
    for(const data of metaData){
        if(data.name==="worldline.json"){
            const dataPath = join(path, data.name)
            const json = await readJson(dataPath, collector)
            return json;
        }
    }
    return null;
}
