import { isEnoent, type WarningCollector } from "@shared/utils/warning"
import { readFile, writeFile } from "node:fs/promises"
import z from "zod"

//? writeElectronsMeta, isEnoent, emptyWorldline
/**
 * Read and validate JSON file based on Zod schema
 * @template T
 */
export async function readJsonWithSchema<T>(
    filePath:string,
    schema: z.ZodType<T>,
    collector?: WarningCollector
):Promise<T|null>{
    let rawText=''
    try {
        rawText = await readFile(filePath, 'utf-8')
    } catch (error) {
        if(!isEnoent(error)){
            collector?.pushWarning(
                filePath,
                'unreadable',
                `Nie można odczytać pliku: ${(error as Error).message}`
            )
        }
        return null;
    }
    let rawJson: unknown;
    try {
        rawJson = JSON.parse(rawText);
    } catch (error) {
        collector?.pushWarning(
            filePath,
            'schema-invalid',
            `Błąd składni pliku JSON: ${(error as Error).message}`
        )
        return null;
    }
    const result = schema.safeParse(rawJson);
    if(!result.success){
        collector?.pushWarning(
            filePath,
            'schema-invalid',
            `Nieprawidłowa struktura danych: ${result.error.issues[0]?.message}`
        );
        return null;
    }
    return result.data;
}


export async function writeJson<T>(
    data: T,
    filePath: string,
    collector: WarningCollector
){
    try {
        const jsonString = JSON.stringify(data);
        await writeFile(filePath, jsonString)
    } catch (error) {
        if(!isEnoent(error)){
            collector?.pushWarning(
                filePath,
                'unreadable',
                `Nie można odczytać pliku: ${(error as Error).message}`
            )
        }
    }
    
}