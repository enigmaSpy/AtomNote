import { writeFileApp } from "@shared/utils/file";

export async function saveCacheElectron(rootPath, atomName, filename, context){
    try {
        await writeFileApp(context, rootPath, atomName, '__cache__', filename)
    } catch (error) {
        console.error(`Zapis ${filename} nieudany:`, error);
        throw new Error(`Błąd zapisu cache: ${(error as Error).message}`);
    }
}