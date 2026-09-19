import type { ParsedWorldline } from "./domain/types";
import type { Flashcard } from "./schemas/flashcard";
import type { QuizQuestion } from "./schemas/quiz";

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    },
    electron:{
        read(path:string, filename:string):Promise<string>,
        save(path:string, filename:string, content: string): Promise<void>,
    },
    study:{
        read(path:string, electronId:string);
        add(path: string,
            electronId: string,
            content: Flashcard[]|QuizQuestion[],
            target: 'flashcard'|'quiz');
        },
    helpers:{
        getPath(rootPath:string,atomName:string):Promise<string>;
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse',
    ELECTRON_READ: 'electron:read',
    ELECTRON_SAVE:'electron:save',
    STUDY_READ:'study:read',
    STUDY_ADD: 'study:add',
    
    HELPERS_GETPATH: 'helpers:getPath'
} as const