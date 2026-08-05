import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type { IpcApi } from '../shared/ipc-contract'

const api: IpcApi = {
  worldline: {
    parse: (rootPath) => ipcRenderer.invoke(IPC_CHANNELS.WORLDLINE_PARSE, rootPath)
    //create()
  },
  electron:{
    read: (rootPath:string, atomName:string, filename:string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_READ, rootPath, atomName, filename),
    saveCache: (rootPath:string, atomName:string, filename:string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_SAVECACHE, rootPath, atomName, filename, content),
    save: (rootPath:string, atomName:string, filename:string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_SAVE, rootPath, atomName, filename, content)
  }
  //atom:{
    //create()
  //}
}

try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error('preload: exposeInMainWorld nie powiodło się', error)
}