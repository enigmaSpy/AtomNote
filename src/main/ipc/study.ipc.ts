import { fetchElectronStudyMaterials } from "@main/services/study/electron-study-read";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerStudyIpc():void{
    ipcMain.handle(IPC_CHANNELS.STUDY_READ,async(_event,rootPath, atomPath, electronId)=>{
        return fetchElectronStudyMaterials(rootPath,atomPath, electronId);
    })
}