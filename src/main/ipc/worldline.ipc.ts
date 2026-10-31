import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-contract";
import { parseWorldline } from "../services/worldline/worldline-parser";
import { addDomain } from "@main/services/worldline/wordline-domain-add";

export function registerWorldlineIpc():void{
    ipcMain.handle(IPC_CHANNELS.WORLDLINE_PARSE, async(_event, rootPath )=>{
        return parseWorldline(rootPath);
    });
    ipcMain.handle(IPC_CHANNELS.WORDLINE_ADDDOMAIN, async(_event, rootPath, domainName)=>{
        return addDomain(rootPath, domainName);
    });
}

