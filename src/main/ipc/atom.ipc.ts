import { createAtom } from "@main/services/atom/atom-create";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerAtomIpc():void{
    ipcMain.handle(IPC_CHANNELS.ATOM_CREATE, async(_event, rootPath,name, content)=>{
        return createAtom(rootPath, name, content);
    })
}