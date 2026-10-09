type Brand<T, B extends string>= T & {readonly __brand:B};
export type WorldlineId = Brand<string, 'WorldlineId'>
export type AtomId = Brand<string, 'AtomId'>
export type ElectronId = Brand<string, 'ElectronId'>
export type DomainId = Brand<string, 'DomainId'>
export type AtomTypeId = Brand<string, 'AtomTypeId'>


export interface Domain{
    id: DomainId
    name: string
}
export interface AtomType{
    id: AtomTypeId
    name: string
}

export interface AtomMeta{
    id: AtomId
    name: string
    description: string
    domainId: DomainId
    typeId: AtomTypeId

    createdAt: string
    updatedAt: string
}
export type AtomDict = Record<AtomId, AtomMeta>
export interface ElectronMeta{
    id: ElectronId
    ownerAtomId: AtomId
    filename: string
    tags: string[]
    mastery: number
    createdAt: string
    updatedAt: string
}
export type ElectronsDict = Record<ElectronId, ElectronMeta>

export type NodeRef=
    |{
        type:'atom'
        id: AtomId
    }
    |{
        type:'electron'
        id: ElectronId
    }

export type EdgeLayer = 
    | 'knowledge'
    | 'plot'

export type EdgeKind =
    | 'bond'
    | 'entanglement'
    | 'reference'
export interface Edge{
    from: NodeRef
    to: NodeRef
    layer: EdgeLayer
    kind: EdgeKind
}
export interface Worldline {
    id: WorldlineId
    name: string
    rootPath: string
    domains: Domain[]
    atomTypes: AtomType[]
    atoms: AtomDict
    electrons: ElectronsDict
    edges: Edge[]
}

export interface AtomView{
    meta: AtomMeta
    tags: string[]
    mastery: number
    ownedElectronIds: ElectronId[]
    referencedElectronIds: ElectronId[]
}

export type WarningReason =
    | 'unexpected-subfolder'
    | 'schema-invalid'
    | 'orphan-file'
    | 'unreadable'
    | 'unreadable-atom'
    | 'missing-edge-target'
    | 'unexpected-file'
    | 'write-failed'
export interface StructuralWarning{
    path: string
    reason: WarningReason
    message: string
}

export interface ParsedWorldline{
    worldline: Worldline
    warnings: StructuralWarning[]
}

export interface FlashcardContent {
    front: string;
    back: string;
}
export interface Flashcard extends FlashcardContent{
    id: string;
    mastery: number;
}
export interface QuizContent{
    question: string;
    answers: string[];
    correctAnswerIndex: number[];
}
export interface QuizQuestion extends QuizContent{
    id: string
    mastery: number
}

export type StudyType = 'flashcards' | 'quizzes'

export type Status = 
    |{status: 'ok'}
    |{status: 'error', message: string}

export type ContentType = 
    |QuizContent
    |FlashcardContent