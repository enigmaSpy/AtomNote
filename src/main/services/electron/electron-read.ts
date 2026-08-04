import { isEnoent } from "@shared/utils/warning";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function readElectron(rootPath, atomName, filename){
    try {
        const filePath = join(rootPath, atomName, filename);
        const data = await readFile(filePath, "utf-8");
        return data;
    } catch (error) {
        if (isEnoent(error)){
            console.error("Nie możan otworzyć pliku");
            return
        }else{
            console.error("nie można odczytać pliku: ", error);
            return
        }
    }
}