//?główna funkcja parseWorldline
import { createWarningCollector } from "@shared/utils/warning"
import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import type { Atom, ParsedWorldline } from '../../shared/domain/types'
import { atomParse } from "./atom-parser"
import { readJsonWithSchema } from "./fs-helpers"
import { WorldlineMetaSchema } from "@shared/schemas/worldline"

export async function parseWorldline(rootPath: string): Promise<ParsedWorldline>{
    const collector = createWarningCollector()
    const atoms: Atom[] = []

    let entries: Dirent[]
    try {
        entries = await readdir(rootPath, { withFileTypes: true })
    } catch (error) {
        collector.pushWarning(rootPath, 'unreadable', `Nie można odczytać korzenia: ${(error as Error).message}`)
        return {
            worldline: { id: basename(rootPath),atomCount:0, name: basename(rootPath), rootPath, atoms: [], edges: [], domains:[] },
            warnings: collector.warnings
        }
    }
    const libraryMeta = await readJsonWithSchema(
        join(rootPath, 'library.json'),
        WorldlineMetaSchema,
        collector
    )
    //? Atomy
    for (const entry of entries) {
        const atom = await atomParse(entry, rootPath, collector)
        if(atom){
            atoms.push(atom)
        }  
    }
    

    return {
        worldline: {
            id: basename(rootPath),
            name: basename(rootPath),
            rootPath,
            domains: libraryMeta?.domains ??[],
            atomCount: atoms.length,
            atoms,
            edges: libraryMeta?.edges??[],            
        },
        warnings: collector.warnings
    }
}




