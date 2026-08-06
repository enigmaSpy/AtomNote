import { deleteFileApp, writeFileApp } from "@shared/utils/file";
import { isEnoent } from "@shared/utils/warning";

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
        throw new Error(`Błąd zapisu pliku: ${(error as Error).message}`); // Zmienione z "cache" na "pliku"
    }

    try {
        await deleteFileApp(rootPath, atomName, '__cache__', filename);
    } catch (error) {
        if (!isEnoent(error)) {
            console.error(`Usunięcie ${filename} z cache nieudane:`, error);
            throw new Error(`Błąd usunięcia cache: ${(error as Error).message}`);
        }
    }
}

