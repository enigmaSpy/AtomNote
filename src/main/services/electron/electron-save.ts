import { writeFileApp } from "@shared/utils/file";

export async function saveElectron(
    rootPath: string, 
    atomName: string, 
    filename: string, 
    context: string
): Promise<void> {
    try {
        await writeFileApp(context, rootPath, atomName, filename);
    } catch (error) {
        console.error(`Zapis ${filename} nieudany:`, error);
        throw new Error(`Błąd zapisu pliku: ${(error as Error).message}`); 
    }
}

