import { WorldlineMetaSchema } from "@shared/schemas/worldline"
import { readJsonWithSchema, writeJson } from "@shared/utils/json"
import { createWarningCollector } from "@shared/utils/warning"
import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import type { Atom, ParsedWorldline } from '../../../shared/domain/types'
import { atomParse } from "../atom/atom-parser"
/**
 * Parsuje pojedyńczy worldline, czyta metadane worldline
 * 
 * @param rootPath ścieżka worldline
 * @returns obietnicę typu Parsedworldline
 */
export async function parseWorldline(rootPath: string): Promise<ParsedWorldline> {
    const collector = createWarningCollector()
    const atoms: Atom[] = []

    let entries: Dirent[]
    try {
        entries = await readdir(rootPath, { withFileTypes: true })
    } catch (error) {
        collector.pushWarning(rootPath, 'unreadable', `Nie można odczytać korzenia: ${(error as Error).message}`)
        return {
            worldline: { id: basename(rootPath), atomCount: 0, name: basename(rootPath), rootPath, atoms: [], edges: [], domains: [] },
            warnings: collector.warnings
        }
    }
    const worldlinePath = join(rootPath, '.worldline_data', 'worldline.json')
    const worldlineMetaRes = await readJsonWithSchema(
        worldlinePath,
        WorldlineMetaSchema,
        collector
    )
    
    let worldlineMeta;
    if (worldlineMetaRes.status === 'ok') {
        worldlineMeta = worldlineMetaRes.data;
    }else{
        worldlineMeta={
            description: "",
            createdAt: new Date().toISOString(),
            domains: [],
            edges: [],
            settings: {}
        }
    
        await writeJson(worldlinePath, worldlineMeta, collector);
    }

    for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('__')) {
            continue;
        }
        const atom = await atomParse(entry, rootPath, collector)
        if (atom) {
            atoms.push(atom)
        }  
    }

    return {
        worldline: {
            id: basename(rootPath),
            name: basename(rootPath),
            rootPath,
            domains: worldlineMeta.domains,
            atomCount: atoms.length,
            atoms,
            edges: worldlineMeta.edges,            
        },
        warnings: collector.warnings
    }
}




