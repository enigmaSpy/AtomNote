import { readElectron } from "@main/services/electron/electron-read";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerElectronIpc():void{
    ipcMain.handle(IPC_CHANNELS.ELECTRON_READ, async(_event, filePath:string)=>{
        return readElectron(filePath);
    })
}