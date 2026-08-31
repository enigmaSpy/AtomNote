import type { ParsedWorldline } from "./domain/types"

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    },
    electron:{
        read(rootPath:string, atomName:string, filename:string):Promise<string>,
        save(rootPath:string, atomName:string, filename:string, content: string)
    },
    study:{
        read(rootPath: string, atomPath:string, electronId:string)
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse',
    ELECTRON_READ: 'electron:read',
    ELECTRON_SAVE:'electron:save',
    STUDY_READ:'study:read'
    
} as const