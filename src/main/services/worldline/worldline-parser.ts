import { WorldlineMetaSchema, type WorldlineMeta } from "@shared/schemas/worldline"
import { readJsonWithSchema, writeJsonWithSchema } from "@shared/utils/json"
import { createWarningCollector } from "@shared/utils/warning"
import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import type { AtomDict, ParsedWorldline, WorldlineId } from '../../../shared/domain/types'
import { atomParse } from "../atom/atom-parser"

/**
 * Parsuje pojedyńczy worldline, czyta metadane worldline
 * 
 * @param rootPath ścieżka worldline
 * @returns obietnicę typu Parsedworldline
 */
export async function parseWorldline(rootPath: string): Promise<ParsedWorldline> {
    const collector = createWarningCollector()
    let atoms: AtomDict={};

    let entries: Dirent[]
    try {
        entries = await readdir(rootPath, { withFileTypes: true })
    } catch (error) {
        collector.pushWarning(rootPath, 'unreadable', `Nie można odczytać korzenia: ${(error as Error).message}`)
        return {
            worldline: {
                id: basename(rootPath) as WorldlineId,
                name: basename(rootPath),
                rootPath,
                domains: {},
                atoms: {},
            },
            warnings: collector.warnings
        }
    }
    const worldlineMetaPath = join(rootPath, '.worldline_data', 'worldline.json')
    const worldlineMetaRes = await readJsonWithSchema(
        worldlineMetaPath,
        WorldlineMetaSchema,
        collector
    );
    let isWorldlineDirty = false;
    let worldlineMeta:WorldlineMeta;
    if (worldlineMetaRes.status === 'ok' && worldlineMetaRes.data) {
        worldlineMeta = worldlineMetaRes.data;
    }else if(worldlineMetaRes.status === 'not-found'){
        worldlineMeta = {
            domains: {},
            settings: {}
        };
    
        isWorldlineDirty = true;
    }else{
        worldlineMeta = {
            domains: {},
            settings: {}
        }
    }
    const worldlineDomains = worldlineMeta.domains;
    
    for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('__')) {
            continue;
        }
        const atom = await atomParse(entry, rootPath, collector)
    
        if (atom) {
            const atomDomainId = atom.meta.domainId;
            if(atomDomainId!==null){
                if(!worldlineDomains[atomDomainId]){
                    isWorldlineDirty = true;
                    collector.pushWarning(rootPath, 'unexpected-domain-id', `Zaadoptowano nieznaną domenę z atomu "${entry.name}"`);
                    worldlineMeta.domains[atomDomainId]={name: 'Adopted domain'}
                }
            }

            atoms[atom.meta.id] = atom
        }  
    }

    if(isWorldlineDirty){
        await writeJsonWithSchema(worldlineMetaPath, WorldlineMetaSchema, worldlineMeta, collector);
    }
    return {
        worldline: {
            id: basename(rootPath) as WorldlineId,
            name: basename(rootPath),
            rootPath,
            domains: worldlineMeta.domains,
            atoms,           
        },
        warnings: collector.warnings
    }
}




