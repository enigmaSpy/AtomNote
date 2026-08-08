import type { ParsedWorldline } from "./domain/types"

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    },
    electron:{
        read(rootPath:string, atomName:string, filename:string):Promise<string>,
        save(rootPath:string, atomName:string, filename:string, content: string)
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse',
    ELECTRON_READ: 'electron:read',
    ELECTRON_SAVE:'electron:save',
} as const