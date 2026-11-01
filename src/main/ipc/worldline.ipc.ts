import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-contract";
import { parseWorldline } from "../services/worldline/worldline-parser";
import { assignDomain } from "@main/services/worldline/wordline-domain-add";

export function registerWorldlineIpc():void{
    ipcMain.handle(IPC_CHANNELS.WORLDLINE_PARSE, async(_event, rootPath )=>{
        return parseWorldline(rootPath);
    });
    ipcMain.handle(IPC_CHANNELS.WORDLINE_ASSIGNDOMAIN, async(_event, rootPath, domainName)=>{
        return assignDomain(rootPath, domainName);
    });
}

