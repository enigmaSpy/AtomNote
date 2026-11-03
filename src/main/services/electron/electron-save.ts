import { writeContentFile } from "@shared/utils/file";

export async function saveElectron(
    rootPath: string,
    atomName: string,
    filename: string, 
    content: string
): Promise<void> {
    try {
        await writeContentFile(content, rootPath, atomName, filename);
    } catch (error) {
        console.error(`Zapis ${filename} nieudany:`, error);
        throw new Error(`Błąd zapisu pliku: ${(error as Error).message}`); 
    }
}

