import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type { IpcApi } from '../shared/ipc-contract'

const api: IpcApi = {
  worldline: {
    parse: (rootPath) => ipcRenderer.invoke(IPC_CHANNELS.WORLDLINE_PARSE, rootPath)
    //create()
  },
  electron:{
    read: (path:string, filename:string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_READ, path, filename),
    save: (path:string, filename:string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_SAVE, path, filename, content)
  },
  //atom:{
    //create()
  //},
  study:{
    read:(path, electronId)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_READ, path, electronId),
    add:(path, electronId, content, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_ADD, path, electronId, content, target),
  },
  helpers:{
    getPath: (rootPath:string, atomName:string)=>ipcRenderer.invoke(IPC_CHANNELS.HELPERS_GETPATH, rootPath, atomName),
  }
}

try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error('preload: exposeInMainWorld nie powiodło się', error)
}