import { isEnoent, type WarningCollector } from "@shared/utils/warning"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname } from "node:path";
import z from "zod"

export type ReadResult<T>=
    | {status: 'ok'; data?: T}
    | {status: 'not-found'}
    | {status: `invalid`}
export type WriteResult =
    | { status: 'ok' }
    | { status: 'invalid' }
    | { status: 'write-failed' };
export async function readJson(path:string, collector:WarningCollector){
    try {
        const data = await readFile(path, 'utf-8');
        return JSON.parse(data)
    } catch (error) {
        collector.pushWarning(path, 'unreadable', `Nie można odczytać pliku: ${(error as Error).message}`)
    }
}
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
):Promise<ReadResult<T>>{
    let rawText:string;
    try {
        rawText = await readFile(filePath, 'utf8')
    } catch (error) {
        if(isEnoent(error)){
            console.error(`not found: ${(error as Error).message}`);
            return {status: 'not-found'} 
        }
        collector?.pushWarning(
            filePath,
            'unreadable',
            `Nie można odczytać pliku: ${(error as Error).message}`
        )
        if(!collector) console.error(`invalid: ${(error as Error).message}`);
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
        if(!collector) console.error(`invalid: ${(error as Error).message}`);
        return {status: 'invalid'};
    }
    
    const result = schema.safeParse(parsedJson);
    if(!result.success){
        collector?.pushWarning(
            filePath,
            'schema-invalid',
            `Nieprawidłowa struktura danych: ${z.prettifyError(result.error)}`
        );
        if (!collector) console.error(`invalid: Nieprawidłowa struktura danych: ${z.prettifyError(result.error)}`);
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
    collector?: WarningCollector
):Promise<boolean>{
    try {
        await mkdir(dirname(filePath), {recursive: true});
        const jsonString = JSON.stringify(data);
        const tmp = `${filePath}.${process.pid}.tmp`;
        await writeFile(tmp, jsonString, 'utf8');
        await rename(tmp, filePath);
        return true;
    } catch (error) {
        collector?.pushWarning(
            filePath,
            'write-failed',
            `Nie można zapisać pliku: ${(error as Error).message}`
        )
        return false
    }   
}

export async function writeJsonWithSchema<T>(
    filePath: string,
    schema: z.ZodType<T>,
    data: T,
    collector?:WarningCollector
):Promise<WriteResult>{
    const result = z.safeEncode(schema,data);
    if(!result.success){
        collector?.pushWarning(
            filePath,
            'schema-invalid',
            `Nieprawidłowa struktura danych: ${z.prettifyError(result.error)}`
        );
        if (!collector) console.error(`invalid: Nieprawidłowa struktura danych: ${z.prettifyError(result.error)}`);
        return {status: 'invalid'}
    }
    const success = await writeJson(filePath, result.data, collector);
    if(!success) return {status:"write-failed"}
    return {status: 'ok'}
}