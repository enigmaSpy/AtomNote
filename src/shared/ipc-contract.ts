import type { ElectronNote, ParsedWorldline } from "./domain/types"

export interface IpcApi{
    worldline:{
        parse(rootPath: string):Promise<ParsedWorldline>
    },
    electron:{
        read(filePath: string):Promise<ElectronNote>
    }
}

export const IPC_CHANNELS = {
    WORLDLINE_PARSE: 'worldline:parse',
    ELECTRON_READ: 'electron:read'
} as const