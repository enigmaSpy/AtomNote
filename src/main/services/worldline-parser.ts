import { readdir } from "node:fs/promises"
import { join, basename } from "node:path"
import type {ParsedWordline, Atom, StructuralWarning} from '../../shared/domain/types'

export async function ParseWordline(rootPath: string): Promise<ParsedWordline>{
    const warnings: StructuralWarning[] = []
    const atoms: Atom[] = []

    const entries = await readdir(rootPath, {withFileTypes: true});

    for (const entry of entries){
        if(!entry.isDirectory()) continue
        if(entry.name.startsWith(".") || entry.name.startsWith("__")) continue

        const atomPath = join(rootPath, entry.name)
        const inner = await readdir(atomPath, {withFileTypes:true});

        for (const child of inner){
            const reserved = child.name.startsWith(".") || child.name.startsWith("__")
            if (child.isDirectory() && reserved){
                warnings.push({
                    path: join(atomPath, child.name),
                    reason: 'unexpected-subfolder',
                    message: `Pod-folder "${child.name}" w awtomie "${entry.name} jest ignorowany"`
                })
            }
        }
        atoms.push({
            id:entry.name,
            name: basename(entry.name),
            description: '',
            tags: [],
            mastery: 0,
            electrons: []
        })
    }
    return {
        wordline: {id: basename(rootPath), name:basename(rootPath), rootPath, atoms, edges:[]},
        warnings
    }
}