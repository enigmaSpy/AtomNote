import { getPath } from "@main/services/helpers/get-path";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerHelpersIpc():void{
    ipcMain.handle(IPC_CHANNELS.HELPERS_GETPATH, async (_event, rootPath, atomName)=>{
        return getPath(rootPath, atomName);
    });
}