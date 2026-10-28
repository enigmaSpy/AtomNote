import type { ContentType, ParsedWorldline, Status, StudyType } from "./domain/types";
import type { AtomMeta } from "./schemas/atom";
import type { ElectronsMetaDict } from "./schemas/electron";
import type { Flashcard } from "./schemas/flashcard";
import type { ElectronId } from "./schemas/ids";
import type { QuizQuestion } from "./schemas/quiz";
//TODO ustalić typ returnów
export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    },
    atom:{
        create(rootPath: string,name: string, content: Omit<AtomMeta, 'id'|'createdAt'|'updatedAt'>):Promise<Status<AtomMeta>>;
        delete(rootPath: string, name: string):Promise<Status>;
        rename(rootPath: string, oldAtomName: string, newAtomName: string):Promise<Status>
    },
    electron:{
        read(path:string, filename:string):Promise<string>,
        save(path:string, filename:string, content: string): Promise<void>,
        create(rootPath: string, atomName: string, electronName: string):Promise<Status<ElectronsMetaDict>>,
        rename(rootPath: string,atomName: string,electronId: ElectronId,newElectronName: string):Promise<Status<string>>,
    },
    study:{
        read(path:string, electronId:string);
        add(path: string,electronId: string,content: Flashcard|QuizQuestion,target: StudyType):Promise<Status>;
        delete(path: string, electronId:string, targetId: string, target: StudyType):Promise<Status>;
        edit(path: string, electronId: string, targerId:string, content: Partial<ContentType>, target: StudyType):Promise<Status>
        },
    helpers:{
        getPath(rootPath:string,atomName:string):Promise<string>;
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse',

    ATOM_CREATE: 'atom:create',
    ATOM_DELETE: 'atom:delete',
    ATOM_RENAME: 'atom:rename',

    ELECTRON_READ: 'electron:read',
    ELECTRON_SAVE: 'electron:save',
    ELECTRON_CREATE: 'electron:create',
    ELECTRON_RENAME: 'electron:rename',

    STUDY_READ:'study:read',
    STUDY_ADD: 'study:add',
    STUDY_DELETE: 'study:delete',
    STUDY_EDIT: 'study:edit',

    HELPERS_GETPATH: 'helpers:getPath'
} as const