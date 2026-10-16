import type { AtomMeta } from "@shared/schemas/atom";
import type { AtomReference, LinksIndex } from "@shared/schemas/edges";
import type { AtomId, DomainId, ElectronId } from "@shared/schemas/ids";

type Brand<T, B extends string>= T & {readonly __brand:B};
export type WorldlineId = Brand<string, 'WorldlineId'>


export interface Domain{
    id: DomainId
    name: string
}

export interface AtomView{
    name: string
    meta: AtomMeta;
    tags: Set<string>;
    mastery: number;

    electrons: ElectronsViewDict;
    references: AtomReference;
    links: LinksIndex;
}
export type AtomDict = Record<AtomId, AtomView>


export interface ElectronView{
    id: ElectronId
    ownerAtomId: AtomId
    filename: string
    tags: Set<string>;
    mastery: number
    createdAt: string
    updatedAt: string
}

export type ElectronsViewDict = Record<ElectronId, ElectronView>


export interface Worldline {
    id: WorldlineId
    name: string
    rootPath: string
    domains: Domain[]
    
    atoms: AtomDict
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


export type Status<T=void> =
    |(T extends void?{status:'ok'}:{status: 'ok', data:T})
    |{status: 'error', message: string}
export type ContentType = 
    |QuizContent
    |FlashcardContent