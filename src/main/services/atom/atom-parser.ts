//? loadOrAdoptAtomMeta, parsowanie elektronów
import { appendElectronData } from "@main/services/electron/electron-appendData"
import type { Atom, ElectronNote } from "@shared/domain/types"
import { AtomMetaSchema, type AtomMeta } from "@shared/schemas/atom"
import { ElectronsDictSchema, type ElectronsDict } from "@shared/schemas/electron"
import { readJsonWithSchema, writeJson } from "@shared/utils/json"
import type { WarningCollector } from "@shared/utils/warning"
import { randomUUID } from "node:crypto"
import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import { electronParse } from "../electron/electron-parser"

/**
 * Parsuje pojedyńczy atom, czyta metadane, skanuje elektrony, adoptuje brakujące wpisy
 * 
 * @param entry wpis katalogu z readdir
 * @param rootPath  ścieżka wordline
 * @param collector kolektor ostrzeżeń strukturalnych
 * @returns  sparsowany Atom lub null kiedy katalog okarzę się nieczytelny
 */
export async function atomParse(
    entry: Dirent, 
    rootPath: string, 
    collector: WarningCollector
): Promise<Atom | null> {
    
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

    const atomMetaRes = await readJsonWithSchema(
        join(atomPath, '.atom_data', 'atom.json'),
        AtomMetaSchema,
        collector
    )

    let currentAtomId: string;
    let atomMeta: AtomMeta | null = null;

    if (atomMetaRes.status === 'ok') {
        atomMeta = atomMetaRes.data;
        currentAtomId = atomMeta.id;
    } else if (atomMetaRes.status === 'not-found') {
        currentAtomId = randomUUID();
        await writeJson(
            join(atomPath, '.atom_data', 'atom.json'),
            {
                id: currentAtomId,
                description: 'adopted',
                tags: [],
                createdAt: new Date().toISOString()
            },
            collector
        )
    } else {
        currentAtomId = randomUUID();
    }

    const electrons: ElectronNote[] = [];
    const newElectronEntries: ElectronsDict = {};

    const electronsRes = await readJsonWithSchema(
        join(atomPath, '.atom_data', 'electrons.json'),
        ElectronsDictSchema,
        collector
    )

    const electronsDict = electronsRes.status === 'ok' ? electronsRes.data : {};

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
        
        if (child.isFile() && !isReserved) {
            const result = await electronParse(child, currentAtomId, electronsDict, collector);
            if (result) {
                electrons.push(result.electron)
                if (result.newMetaEntry) {
                    Object.assign(newElectronEntries, result.newMetaEntry);
                }
            }
        }
    }

    if (Object.keys(newElectronEntries).length > 0) {
        await appendElectronData(atomPath, newElectronEntries, collector)
    }

    const totalElectronMastery = electrons.reduce((acc, cur) => acc + cur.mastery, 0);
    const atomMastery = electrons.length > 0 ? totalElectronMastery / electrons.length : 0;

    const atom: Atom = {
        id: currentAtomId,
        name: basename(entry.name),
        description: atomMeta?.description ?? '',
        tags: atomMeta?.tags ?? [],
        mastery: atomMastery,
        electrons
    }
    return atom
}