export type AtomId = string
export type ElectronId = string 
export type WorldlineId = string

export interface ElectronNote{
    id: ElectronId
    atomId: AtomId
    filename: string
    tags: string[]
    covalentAtomIds: AtomId[]
    mastery: number
    createdAt: string
    updatedAt: string
}
export type ElectronsDict = Record<ElectronId, ElectronNote>
export interface Atom{
    id: AtomId
    name: string
    description: string
    tags: string[]
    mastery: number
    electrons: ElectronNote[]
}

export type EdgeLayer = 'knowledge' | 'plot'
export type EdgeKind = 'bond' | 'entanglement' //| 'parent-child' 
export interface Edge{
    from: AtomId | ElectronId
    to: AtomId | ElectronId
    layer: EdgeLayer
    kind: EdgeKind 
}
export interface Domain{
    id: string
    name: string
    tags: string[]
}
export interface WorldlineDescriptor{
    id: WorldlineId
    name: string
    rootPath: string
    atomCount: number
    domains: Domain[]
}   
export interface Worldline extends WorldlineDescriptor{
    atoms: Atom[]
    edges: Edge[]
}

export type WarningReason = 
    | 'unexpected-subfolder'     // pod-folder w atomie (zasada dwóch poziomów)
    | 'schema-invalid'           // JSON istnieje, ale nie przechodzi walidacji Zod
    | 'orphan-file'              // plik luzem w korzeniu worldlinea
    | 'unreadable'               // nieczytelny korzeń / plik metadanych
    | 'unreadable-atom'          // nieczytelny katalog atomu
    | 'missing-covalent-target'  // kowalencja wskazuje nieistniejący atom
    | 'unexpected-file'
export interface StructuralWarning{
    path: string
    reason: WarningReason
    message: string
}

export interface ParsedWorldline{
    worldline: Worldline
    warnings: StructuralWarning[]
}
