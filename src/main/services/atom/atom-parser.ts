//? loadOrAdoptAtomMeta, parsowanie elektronów
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

    let atomMeta: AtomMeta;
    if(atomMetaRes.status === "ok"){
        atomMeta = atomMetaRes.data;
    }else{
        atomMeta ={
            id: randomUUID(),
            description: 'adopted',
            tags: [],
            createdAt: new Date().toISOString()
        };
        await writeJson(atomMetaPath, atomMeta, collector);
    }
    const currentAtomId = atomMeta.id;

    const electronsPath = join(atomPath, '.atom_data', 'electrons.json');
    const electronsRes = await readJsonWithSchema(electronsPath, ElectronsDictSchema, collector);
    
    let isElectronsDirty = electronsRes.status !== 'ok';
    const electronsDict: ElectronsDict = electronsRes.status === 'ok' ? electronsRes.data : {};

    const electrons: ElectronNote[] = [];

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
            let electronMeta;

            if(dictEntry){
                electronId = dictEntry[0];
                electronMeta = dictEntry[1];
            }else{
                electronId = randomUUID();
                electronMeta = {
                    filename: currentElectron.name,
                    tags: [],
                    covalentAtomsIds: [],
                    createdAt: new Date().toISOString(),
                    upDatedAt: new Date().toISOString()
                };
                electronsDict[electronId] = electronMeta;
                isElectronsDirty = true;
            }

            const parsedElectron = await electronParse(currentElectron, currentAtomId, electronId, electronMeta, collector);
            if (parsedElectron){
                electrons.push(parsedElectron);
            }
        }
    }

    if (isElectronsDirty){
        await writeJson(electronsPath, electronsDict, collector);
    }
    const totalElectronMastery = electrons.reduce((acc, cur)=> acc+cur.mastery, 0);
    const atomMastery = electrons.length > 0 ? totalElectronMastery/electrons.length:0;

    return {
        id: currentAtomId,
        name: basename(entry.name),
        description: atomMeta.description,
        tags: atomMeta.tags,
        mastery: Number(atomMastery.toFixed(2)),
        electrons
    }
}