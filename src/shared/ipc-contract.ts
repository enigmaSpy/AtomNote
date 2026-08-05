import type { ParsedWorldline } from "./domain/types"

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    },
    electron:{
        read(rootPath:string, atomName:string, filename:string):Promise<string>,
        saveCache(rootPath:string, atomName:string, filename:string, content: string),
        save(rootPath:string, atomName:string, filename:string, content: string)//TODO: to + usówanie electron cache
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse',
    ELECTRON_READ: 'electron:read',
    ELECTRON_SAVE:'electron:save',
    ELECTRON_SAVECACHE:'electron:savecache',
} as const