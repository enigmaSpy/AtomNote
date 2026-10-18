import type { ContentType, ParsedWorldline, Status, StudyType } from "./domain/types";
import type { AtomMeta } from "./schemas/atom";
import type { Flashcard } from "./schemas/flashcard";
import type { QuizQuestion } from "./schemas/quiz";
//TODO ustalić typ returnów
export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    },
    electron:{
        read(path:string, filename:string):Promise<string>,
        save(path:string, filename:string, content: string): Promise<void>,
    },
    atom:{
        create(rootPath: string,name: string, content: Omit<AtomMeta, 'id'|'createdAt'|'updatedAt'>):Promise<Status<AtomMeta>>;
        delete(rootPath: string, name: string):Promise<Status>
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

    ELECTRON_READ: 'electron:read',
    ELECTRON_SAVE: 'electron:save',

    ATOM_CREATE: 'atom:create',
    ATOM_DELETE: 'atom:delete',

    STUDY_READ:'study:read',
    STUDY_ADD: 'study:add',
    STUDY_DELETE: 'study:delete',
    STUDY_EDIT: 'study:edit',

    HELPERS_GETPATH: 'helpers:getPath'
} as const