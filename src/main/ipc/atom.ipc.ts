import { createAtom } from "@main/services/atom/atom-create";
import { deleteAtom } from "@main/services/atom/atom-delete";
import { renameAtom } from "@main/services/atom/atom-rename";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerAtomIpc():void{
    ipcMain.handle(IPC_CHANNELS.ATOM_CREATE, async(_event, rootPath,name, content)=>{
        return createAtom(rootPath, name, content);
    });
    ipcMain.handle(IPC_CHANNELS.ATOM_DELETE, async(_event, rootPath, name)=>{
        return deleteAtom(rootPath, name);
    })
    ipcMain.handle(IPC_CHANNELS.ATOM_RENAME, async(_event, rootPath, oldAtomName, newAtomName)=>{
        return renameAtom(rootPath, oldAtomName, newAtomName);
    })
}