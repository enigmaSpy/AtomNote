import { isEnoent, type WarningCollector } from "@shared/utils/warning"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path";
import z from "zod"

export type ReadResult<T>=
    | {status: 'ok'; data: T}
    | {status: 'not-found'}
    | {status: `invalid`}
//? writeElectronsMeta, isEnoent, emptyWorldline
/**
 * Bezpieczne odczytanie pliku JSON i walidacja ze schematem Zoda
 * 
 * @param filePath 
 * @param schema 
 * @param collector 
 * @param test 
 * @returns 
 */
export async function readJsonWithSchema<T>(
    filePath:string,
    schema: z.ZodType<T>,
    collector?: WarningCollector,
    test?: boolean
):Promise<ReadResult<T>>{
    let rawText:string;
    try {
        rawText = await readFile(filePath, 'utf-8')
    } catch (error) {
        if(isEnoent(error)){
           return {status: 'not-found'} 
        }
        collector?.pushWarning(
            filePath,
            'unreadable',
            `Nie można odczytać pliku: ${(error as Error).message}`
        )
        return {status: 'invalid'}
    }

    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(rawText);
    } catch (error) {
        collector?.pushWarning(
            filePath,
            'schema-invalid',
            `Błąd składni pliku JSON: ${(error as Error).message}`
        )
        return {status: 'invalid'};
    }
    
    const result = schema.safeParse(parsedJson);
    if(!result.success){
        collector?.pushWarning(
            filePath,
            'schema-invalid',
            `Nieprawidłowa struktura danych: ${result.error.issues[0]?.message}`
        );
        return {status: 'invalid'};
    }
    return {status: 'ok',data:result.data};
}

/**
 * 
 * @param filePath 
 * @param data 
 * @param collector 
 */
export async function writeJson<T>(
    filePath: string,
    data: T,
    collector: WarningCollector
):Promise<boolean>{
    try {
        await mkdir(dirname(filePath), {recursive: true});
        const jsonString = JSON.stringify(data);
        await writeFile(filePath, jsonString);
        return true;
    } catch (error) {
        if(!isEnoent(error)){
            collector?.pushWarning(
                filePath,
                'unreadable',
                `Nie można odczytać pliku: ${(error as Error).message}`
            )
        }
        return false
    }
    
}