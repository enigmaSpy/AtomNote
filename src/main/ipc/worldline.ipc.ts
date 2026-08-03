import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-contract";
import { parseWorldline } from "../services/worldline/worldline-parser";

export function registerWorldlineIpc():void{
    ipcMain.handle(IPC_CHANNELS.WORLDLINE_PARSE, async(_event, rootPath: string)=>{
        return parseWorldline(rootPath);
    });
}

