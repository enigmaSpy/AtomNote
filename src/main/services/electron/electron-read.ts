import { readFileApp } from "@main/utils/file";

export async function readElectron(rootPath:string, atomName: string, filename: string){
    try {
        return await readFileApp(rootPath, atomName, filename);
    } catch (error) {
        console.error("nie można odczytać pliku: ", error);
        return
    }
}