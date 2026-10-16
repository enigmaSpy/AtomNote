//? loadOrAdoptAtomMeta, parsowanie elektronów
import type { AtomView , ElectronsViewDict } from "@shared/domain/types"
import { AtomMetaSchema, type AtomMeta } from "@shared/schemas/atom"
import { ElectronsDictSchema, type ElectronMeta, type ElectronsMetaDict } from "@shared/schemas/electron"
import { readJsonWithSchema, writeJsonWithSchema } from "@shared/utils/json"
import type { WarningCollector } from "@shared/utils/warning"
import { randomUUID } from "crypto"
import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import type { AtomId, ElectronId } from "@shared/schemas/ids"

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
): Promise<AtomView | null> {
    
    const atomPath = join(rootPath, entry.name);
    let currentAtomFiles: Dirent[] = [];
    try {
        currentAtomFiles = await readdir(atomPath, { withFileTypes: true })
    } catch (error) {
        collector.pushWarning(
            atomPath,
            'unreadable-atom',
            `Nie można odczytać "${entry.name}": ${(error as Error).message}`
        );            
        return null;
    }

    const atomMetaPath = join(atomPath, '.atom_data', 'atom.json');
    const atomMetaRes = await readJsonWithSchema(
        atomMetaPath,
        AtomMetaSchema,
        collector
    );

    let atomMeta: AtomMeta
    if(atomMetaRes.status === "ok" && atomMetaRes.data !== undefined){
        atomMeta = atomMetaRes.data;
    }else{
        atomMeta ={
            id: randomUUID() as AtomId,
            description: 'adopted',
            domainId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await writeJsonWithSchema(atomMetaPath,AtomMetaSchema, atomMeta, collector);
    }
    const currentAtomId = atomMeta.id;

    const electronsPath = join(atomPath, '.atom_data', 'electrons.json');
    const electronsRes = await readJsonWithSchema(electronsPath, ElectronsDictSchema, collector);
    
    let isElectronsDirty = false;
    const electronsDict: ElectronsMetaDict =
        electronsRes.status === 'ok' && electronsRes.data !== undefined
            ? electronsRes.data
            : {};
    
    if(electronsRes.status === 'not-found'){
        isElectronsDirty = true;
    }
    const electronIdByFilename = new Map(
        Object.entries(electronsDict).map(
        ([id, meta])=> [meta.filename, id as ElectronId]
        )
    );

    let electronsViewDict: ElectronsViewDict = {};
    const tagsSet = new Set<string>();

    for(const currentElectron of currentAtomFiles){
        const isReserved = currentElectron.name.startsWith('.')||currentElectron.name.startsWith('__');
        if(currentElectron.isDirectory() && !isReserved){
            collector.pushWarning(
                join(atomPath,currentElectron.name),
                'unexpected-subfolder',
                `Podfolder ${currentElectron.name} w ${entry.name} jest ignorowany`);
            continue;
        }
        if(!currentElectron.isFile()) continue;

        const ext = currentElectron.name.split('.').pop()?.toLowerCase();

        if (ext !== 'md' && ext !== 'txt') {
            collector.pushWarning(
                join(atomPath, currentElectron.name),
                'unexpected-file',
                `Plik "${currentElectron.name}" ma nieobsługiwane rozszerzenie .${ext} i został zignorowany.`
            );
            continue;
        }
        let electronId: ElectronId;
        let electronMeta:ElectronMeta;
        const existingElectronId = electronIdByFilename.get(currentElectron.name);

        if(existingElectronId){
            const existingMeta = electronsDict[existingElectronId];
            if(existingMeta){
                electronId = existingElectronId;
                electronMeta = existingMeta;
            }else{
                electronId = randomUUID() as ElectronId;

                electronMeta = {
                    filename: currentElectron.name,
                    tags: new Set<string>(),
                    mastery: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                electronsDict[electronId] = electronMeta;
                isElectronsDirty = true;
            }
        }else{
            electronId = randomUUID() as ElectronId;
            electronMeta = {
                filename: currentElectron.name,
                tags: new Set<string>(),
                mastery: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            electronsDict[electronId] = electronMeta;
            
            isElectronsDirty = true;
        }
        electronsViewDict[electronId] ={
                ...electronMeta,
                id: electronId,
                ownerAtomId: currentAtomId
            } 
    }

    if (isElectronsDirty){
        await writeJsonWithSchema(electronsPath,ElectronsDictSchema, electronsDict, collector);
    }
    const electronMeta = Object.values(electronsDict);
    const totalElectronMastery = electronMeta.reduce((acc, cur)=> acc + cur.mastery, 0);
    const atomMastery = electronMeta.length > 0 ? totalElectronMastery / electronMeta.length : 0;

    return {
        meta: atomMeta,
        tags: tagsSet,
        name: basename(entry.name),
        mastery: Number(atomMastery.toFixed(2)),
        electrons: electronsViewDict,
        references: {
            referencedAtoms: [],
            referencedElectrons: {}
        }, //TODO: dodać obsługe w późniejszej wersji
        links: {} //TODO: dodać obsługe w późniejszej wersji
    }
}