import { readElectron } from "@main/services/electron/electron-read";
import { saveCacheElectron } from "@main/services/electron/electron-saveCache";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerElectronIpc():void{
    ipcMain.handle(IPC_CHANNELS.ELECTRON_READ, async(_event, rootPath, atomName, filename)=>{
        return readElectron(rootPath, atomName, filename);
    });
    ipcMain.handle(IPC_CHANNELS.ELECTRON_SAVECACHE, async(_event, rootPath, atomName,filename,context)=>{
        return saveCacheElectron(rootPath, atomName, filename, context);
    })
}
