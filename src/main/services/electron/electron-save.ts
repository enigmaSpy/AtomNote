import { writeFileApp } from "@shared/utils/file";

export async function saveElectron(
    path:string,
    filename: string, 
    context: string
): Promise<void> {
    try {
        await writeFileApp(context, path, filename);
    } catch (error) {
        console.error(`Zapis ${filename} nieudany:`, error);
        throw new Error(`Błąd zapisu pliku: ${(error as Error).message}`); 
    }
}

