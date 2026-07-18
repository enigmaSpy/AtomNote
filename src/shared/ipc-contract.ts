import type { ParsedWordline } from "./domain/types"

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWordline>
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse'
} as const