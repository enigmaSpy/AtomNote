//? loadOrAdoptAtomMeta, parsowanie elektronów
import type { AtomView , ElectronsViewDict, ElectronView } from "@shared/domain/types"
import { AtomMetaSchema, type AtomMeta } from "@shared/schemas/atom"
import { ElectronsDictSchema, type ElectronMeta, type ElectronsMetaDict } from "@shared/schemas/electron"
import { readJsonWithSchema, writeJsonWithSchema } from "@shared/utils/json"
import type { WarningCollector } from "@shared/utils/warning"
import { randomUUID } from "node:crypto"
import type { Dirent } from "node:fs"
import { readdir } from "node:fs/promises"
import { basename, join } from "node:path"
import type { AtomId, DomainId, ElectronId } from "@shared/schemas/ids"

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

    const atomMetaPath = join(atomPath, '.atom_data', 'atom.json')
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
            domainId: randomUUID() as DomainId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await writeJsonWithSchema(atomMetaPath,AtomMetaSchema, atomMeta, collector);
    }
    const currentAtomId = atomMeta.id;

    const electronsPath = join(atomPath, '.atom_data', 'electrons.json');
    const electronsRes = await readJsonWithSchema(electronsPath, ElectronsDictSchema, collector);
    
    let isElectronsDirty = electronsRes.status !== 'ok';
    const electronsDict: ElectronsMetaDict =
        electronsRes.status === 'ok' && electronsRes.data !== undefined
            ? electronsRes.data
            : {};

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
        
        if(currentElectron.isFile()&&!isReserved){
            const dictEntry = Object.entries(electronsDict).find(([_, meta])=>meta.filename === currentElectron.name);

            let electronId: string;
            let electronMeta:ElectronMeta;
            let electronView: ElectronView;
            if(dictEntry){
                electronId = dictEntry[0];
                electronMeta = dictEntry[1];
                electronView = {
                    id: dictEntry[0] as ElectronId,
                    ownerAtomId: currentAtomId,
                    ...electronMeta
                }
            }else{
                electronId = randomUUID();
                electronMeta = {
                    filename: basename(currentElectron.name),
                    tags: new Set<string>(),
                    mastery: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                electronView={
                    ...electronMeta,
                    id: electronId as ElectronId,
                    ownerAtomId: currentAtomId,
                }
                isElectronsDirty = true;
            }
            electronMeta.tags.forEach(tag => tagsSet.add(tag));
            electronsViewDict[electronId] = electronView;
            electronsDict[electronId] = electronMeta;
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
        references: null, //TODO: dodać obsługe w późniejszej wersji
        links: null //TODO: dodać obsługe w późniejszej wersji
    }
}