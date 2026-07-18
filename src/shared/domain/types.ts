export type AtomId = string
export type ElectronId = string 
export type WorldlineId = string

export interface Tag {
    name: string
}

export interface ElectronNote{
    id: ElectronId
    filename: string
    tags: string[]
    mastery: number
    createdAt: string
    updatedAt: string
}

export interface Atom{
    id: AtomId
    name: string
    description: string
    tags: string[]
    mastery: number
    electrons: ElectronNote[]
}

export type EdgeLayer = 'knowledge' | 'plot'
export type EdgeKind = 'bond' | 'entanglement' | 'parent-child'
export interface Edge{
    from: AtomId | ElectronId
    to: AtomId | ElectronId
    layer: EdgeLayer
    kind: EdgeKind 
}

export interface Worldline {
    id: WorldlineId
    name: string
    rootPath: string
    atoms: Atom[]
    edges: Edge[]
}

export type WarningReason = 'unexpected-subfolder' | 'schema-invalid' | 'orphan-file'
export interface StructuralWarning{
    path: string
    reason: WarningReason
    message: string
}

export interface ParsedWordline{
    wordline: Worldline
    warnings: StructuralWarning[]
}
