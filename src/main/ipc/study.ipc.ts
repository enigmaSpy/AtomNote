import { fetchElectronStudyMaterials } from "@main/services/study/electron-study-read";
import { IPC_CHANNELS } from "@shared/ipc-contract";
import { ipcMain } from "electron";
import { deleteElectronStudy } from "@main/services/study/electron-study-delete";
import { addElectronStudyData } from "@main/services/study/electron-study-add";
import { editStudyData } from "@main/services/study/electron-study-edit";

export function registerStudyIpc():void{
    ipcMain.handle(IPC_CHANNELS.STUDY_READ,async(_event,rootPath, atomName, electronId)=>{
        return fetchElectronStudyMaterials(rootPath, atomName, electronId);
    });
    ipcMain.handle(IPC_CHANNELS.STUDY_ADD, async(_event,rootPath, atomName, electronId, content, target)=>{
        return addElectronStudyData(rootPath, atomName, electronId, content, target)
    });
    ipcMain.handle(IPC_CHANNELS.STUDY_DELETE, async(_event, rootPath, atomName, electronId, targetId, target)=>{
        return deleteElectronStudy(rootPath, atomName, electronId, targetId, target);
    });
    ipcMain.handle(IPC_CHANNELS.STUDY_EDIT, async(_event, rootPath, atomName, electronId, targerId, content, target)=>{
        return editStudyData(rootPath, atomName, electronId, targerId, content, target);
    })
}
