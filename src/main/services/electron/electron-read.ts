import { readFileApp } from "@shared/utils/file";


export async function readElectron(path, filename){
    try {
        return await readFileApp(path, filename);
    } catch (error) {
        console.error("nie można odczytać pliku: ", error);
        return
    }
}