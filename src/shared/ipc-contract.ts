import type { AtomCreatePayload } from "@main/services/atom/atom-create";
import type { DomainsDict, ParsedWorldline, Status } from "./domain/types";
import type { ElectronsMetaDict } from "./schemas/electron";
import type { Flashcard } from "./schemas/flashcard";
import type { ElectronId, FlashcardId, QuizId } from "./schemas/ids";
import type { QuizQuestion } from "./schemas/quiz";
import type { CreateAtomOutput, StudyItemEntry, StudyItemEntryEdit, StudyItemsPacket, StudyType } from "./domain/study";

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
        assignDomain(rootPath: string, domainName: string):Promise<Status<DomainsDict>>
    },
    atom:{
        create(rootPath: string,name: string, domainName: string|null, content: AtomCreatePayload):Promise<Status<CreateAtomOutput>>;
        delete(rootPath: string, name: string):Promise<Status>;
        rename(rootPath: string, oldAtomName: string, newAtomName: string):Promise<Status>
    },
    electron:{
        read(rootPath: string, atomName: string, filename:string):Promise<string>,
        save(rootPath: string, atomName: string, filename:string, content: string): Promise<void>,
        create(rootPath: string, atomName: string, electronName: string):Promise<Status<ElectronsMetaDict>>,
        rename(rootPath: string,atomName: string,electronId: ElectronId,newElectronName: string):Promise<Status<string>>,
        delete(rootPath: string, atomName:string, electronId:ElectronId):Promise<Status>,
    },
    study:{
        read(rootPath:string, atomName:string, electronId:string): Promise<Status<StudyItemsPacket>>;
        add(rootPath:string, atomName:string,electronId: string,payload: StudyItemEntry):Promise<Status<Flashcard|QuizQuestion>>;
        delete(rootPath: string, atomName: string, electronId:string, targetId: FlashcardId | QuizId, target: StudyType):Promise<Status>;
        edit(rootPath:string, atomName:string, electronId: string, targetId:string, payload: StudyItemEntryEdit):Promise<Status>
        },
    helpers:{
        getPath(rootPath:string,atomName:string):Promise<string>;
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse',
    WORDLINE_ASSIGNDOMAIN: 'worldline:assignDomain',

    ATOM_CREATE: 'atom:create',
    ATOM_DELETE: 'atom:delete',
    ATOM_RENAME: 'atom:rename',

    ELECTRON_READ: 'electron:read',
    ELECTRON_SAVE: 'electron:save',
    ELECTRON_CREATE: 'electron:create',
    ELECTRON_RENAME: 'electron:rename',
    ELECTRON_DELETE: 'electron:delete',

    STUDY_READ:'study:read',
    STUDY_ADD: 'study:add',
    STUDY_DELETE: 'study:delete',
    STUDY_EDIT: 'study:edit',

    HELPERS_GETPATH: 'helpers:getPath'
} as const