import { readdir, type Dirent } from "node:fs/promises"
import { basename, join } from "node:path"
import type { Atom, ParsedWorldline, StructuralWarning } from '../../shared/domain/types'

export async function ParseWordline(rootPath: string): Promise<ParsedWorldline>{
    const warnings: StructuralWarning[] = []
    const atoms: Atom[] = []

    const entries = await readdir(rootPath, {withFileTypes: true});

    for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') || entry.name.startsWith('__')) continue

    const atomPath = join(rootPath, entry.name)

    let inner: Dirent<string>[]
    try {
      inner = await readdir(atomPath, { withFileTypes: true, encoding: 'utf8' })
    } catch (err) {
      warnings.push({
        path: atomPath,
        reason: 'orphan-file',
        message: `Nie można odczytać "${entry.name}": ${(err as Error).message}`
      })
      continue 
    }

    for (const child of inner) {
      const reserved = child.name.startsWith('.') || child.name.startsWith('__')
      if (child.isDirectory() && !reserved) {
        warnings.push({
          path: join(atomPath, child.name),
          reason: 'unexpected-subfolder',
          message: `Pod-folder "${child.name}" w atomie "${entry.name}" jest ignorowany (zasada dwóch poziomów, §3.3).`
        })
      }
    }

    atoms.push({
      id: entry.name,
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