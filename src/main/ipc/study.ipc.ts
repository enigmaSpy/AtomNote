import { addElectronStudyData } from "@main/services/study/electron-study-write";
import { fetchElectronStudyMaterials } from "@main/services/study/electron-study-read";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";

export function registerStudyIpc():void{
    ipcMain.handle(IPC_CHANNELS.STUDY_READ,async(_event,path, electronId)=>{
        return fetchElectronStudyMaterials(path, electronId);
    });
    ipcMain.handle(IPC_CHANNELS.STUDY_ADD, async(_event,path,electronId, content, target)=>{
        return addElectronStudyData(path,electronId, content, target)
    });
}

