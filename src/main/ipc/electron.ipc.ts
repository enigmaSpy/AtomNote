import { readElectron } from "@main/services/electron/electron-read";
import { saveElectron } from "@main/services/electron/electron-save";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerElectronIpc():void{
    ipcMain.handle(IPC_CHANNELS.ELECTRON_READ, async(_event, path, filename)=>{
        return readElectron(path, filename);
    });
    ipcMain.handle(IPC_CHANNELS.ELECTRON_SAVE, async(_event, path,filename,context)=>{
        return saveElectron(path, filename, context);
    })
}
