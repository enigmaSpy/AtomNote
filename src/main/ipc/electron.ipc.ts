import { readElectron } from "@main/services/electron/electron-read";
import { saveElectron } from "@main/services/electron/electron-save";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerElectronIpc():void{
    ipcMain.handle(IPC_CHANNELS.ELECTRON_READ, async(_event, rootPath, atomName, filename)=>{
        return readElectron(rootPath, atomName, filename);
    });
    ipcMain.handle(IPC_CHANNELS.ELECTRON_SAVE, async(_event, rootPath, atomName,filename,context)=>{
        return saveElectron(rootPath, atomName, filename, context);
    })
}
