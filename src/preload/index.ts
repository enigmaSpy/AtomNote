import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type { IpcApi } from '../shared/ipc-contract'

const api: IpcApi = {
  worldline: {
    parse: (rootPath) => ipcRenderer.invoke(IPC_CHANNELS.WORLDLINE_PARSE, rootPath)
  }
}

try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error('preload: exposeInMainWorld nie powiodło się', error)
}