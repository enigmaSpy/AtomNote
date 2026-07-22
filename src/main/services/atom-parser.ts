//? loadOrAdoptAtomMeta, parsowanie elektronów
import type { Atom, ElectronNote } from "@shared/domain/types"
import type { WarningCollector } from "@shared/utils/warning"
import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import { readJsonWithSchema } from "./fs-helpers"
import { AtomMetaSchema } from "@shared/schemas/atom"
import { ElectronsDictSchema } from "@shared/schemas/electron"
import { electronParse } from "./electron-parser"
import { randomUUID } from "node:crypto"

export async function atomParse(entry:Dirent, rootPath:string, collector:WarningCollector):Promise<Atom | null>{
    
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('__')) {
        return null
    }
    const atomPath = join(rootPath, entry.name)

    let inner: Dirent[] = []
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
    const electronsDict = await readJsonWithSchema(
        join(atomPath, '.atom_data', 'electrons.json'),
        ElectronsDictSchema,
        collector
    )
    const currentAtomId = atomMeta?.id ?? randomUUID();
    const electrons: ElectronNote[] = [];
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
            const electron = electronParse(child, currentAtomId, electronsDict, collector);
            if(electron){
                electrons.push(electron)
            }
        }
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