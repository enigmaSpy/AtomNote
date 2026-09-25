import { fetchElectronStudyMaterials } from "@main/services/study/electron-study-read";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";
import { deleteElectronStudy } from "@main/services/study/electron-study-delete";
import { addElectronStudyData } from "@main/services/study/electron-study-add";
import { editStudyData } from "@main/services/study/electron-study-edit";

export function registerStudyIpc():void{
    ipcMain.handle(IPC_CHANNELS.STUDY_READ,async(_event,path, electronId)=>{
        return fetchElectronStudyMaterials(path, electronId);
    });
    ipcMain.handle(IPC_CHANNELS.STUDY_ADD, async(_event,path, electronId, content, target)=>{
        return addElectronStudyData(path, electronId, content, target)
    });
    ipcMain.handle(IPC_CHANNELS.STUDY_DELETE, async(_event, path, electronId, targetId, target)=>{
        return deleteElectronStudy(path, electronId, targetId, target);
    });
    ipcMain.handle(IPC_CHANNELS.STUDY_EDIT, async(_event, path, electronId, targerId, content, target)=>{
        return editStudyData(path, electronId, targerId, content, target);
    })
}
