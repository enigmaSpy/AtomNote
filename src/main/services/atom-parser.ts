//? loadOrAdoptAtomMeta, parsowanie elektronów
import type { Atom, ElectronNote } from "@shared/domain/types"
import type { WarningCollector } from "@shared/utils/warning"
import { mkdir, readdir, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"
import { AtomMetaSchema } from "@shared/schemas/atom"
import { ElectronsDictSchema, type ElectronsDict } from "@shared/schemas/electron"
import { electronParse } from "./electron-parser"
import { randomUUID } from "node:crypto"
import { readJsonWithSchema } from "@shared/utils/json"
import type { Dirent } from "node:fs"
import { appendElectronDate } from "@shared/utils/electron-appendData"

/**
 * Parsuje pojedyńczy atom, czyta metadane, skanuje elektrony, adoptuje brakujące wpisy
 * 
 * @param entry wpis katalogu z readdir
 * @param rootPath  ścieżka wordline
 * @param collector kolektor ostrzeżeń strukturalnych
 * @returns  sparsowany Atom lub null kiedy katalog okarzę się nieczytelny
 */
export async function atomParse(
    entry:Dirent, 
    rootPath:string, 
    collector:WarningCollector):Promise<Atom | null>{
    
    const atomPath = join(rootPath, entry.name);
    let inner: Dirent[] = [];
    try {
        inner = await readdir(atomPath, { withFileTypes: true })
    } catch (error) {
        collector.pushWarning(
            atomPath,
            'unreadable-atom',
            `Nie można odczytać "${entry.name}": ${(error as Error).message}`
        )            
        return null;
    }

    const atomMeta = await readJsonWithSchema(
        join(atomPath, '.atom_data', 'atom.json'),
        AtomMetaSchema,
        collector
    )
    const currentAtomId = atomMeta?.id ?? randomUUID();

    if (atomMeta?.id === undefined){
        await mkdir(join(atomPath, '.atom_data'), {recursive: true})
        await writeFile(
            join(atomPath, '.atom_data', 'atom.json'),
            JSON.stringify({
                id:currentAtomId,
                description: 'adopted',
                tags: [],
                createdAt: new Date().toISOString()
            }, null, 2)
        );
    }
    const electronsDict = await readJsonWithSchema(
        join(atomPath, '.atom_data', 'electrons.json'),
        ElectronsDictSchema,
        collector
    )
    const electrons: ElectronNote[] = [];
    const newElectronEntries: ElectronsDict = {};

    //? Elektrony
    for (const child of inner) {
        const isReserved = child.name.startsWith('.') || child.name.startsWith('__')
        if (child.isDirectory() && !isReserved) {
            collector.pushWarning(
                join(atomPath, child.name),
                'unexpected-subfolder',
                `Pod-folder "${child.name}" w atomie jest ignorowany.`
            )
            continue
        }
        if(child.isFile()&&!isReserved){
            const result = await electronParse(child, currentAtomId, electronsDict, collector);
            if(result){
                electrons.push(result.electron)
                if(result.newMetaEntry){
                    Object.assign(newElectronEntries, result.newMetaEntry);
                }
            }
        }
    }
    if (Object.keys(newElectronEntries).length > 0){
        await appendElectronDate(atomPath, newElectronEntries, collector)
    }
    const atom={
        id: currentAtomId,
        name: basename(entry.name),
        description: atomMeta?.description??'',
        tags: atomMeta?.tags??[],
        mastery: 0,//TODO: Dodać funkcję obliczającą
        electrons
    }
    return atom
}