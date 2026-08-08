import { readFileApp } from "@shared/utils/file";


export async function readElectron(rootPath, atomName, filename){
    try {
        return await readFileApp(rootPath, atomName, filename);
    } catch (error) {
        console.error("nie można odczytać pliku: ", error);
        return
    }
}