import type { ParsedWorldline } from "./domain/types"

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse'
} as const