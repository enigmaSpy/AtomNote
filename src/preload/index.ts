import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type { IpcApi } from '../shared/ipc-contract'
import type { AtomCreatePayload } from '@main/services/atom/atom-create'

const api: IpcApi = {
  worldline: {
    parse: (rootPath) => ipcRenderer.invoke(IPC_CHANNELS.WORLDLINE_PARSE, rootPath),
    //create()

    assignDomain: (rootPath, domainName) => ipcRenderer.invoke(IPC_CHANNELS.WORDLINE_ASSIGNDOMAIN, rootPath, domainName),
  },
  electron:{
    read: (rootPath:string, atomName:string, filename:string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_READ,  rootPath, atomName, filename),
    save: (rootPath:string, atomName:string, filename:string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_SAVE,  rootPath, atomName, filename, content),
    create: (rootPath:string, atomName:string, electronName:string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_CREATE, rootPath, atomName, electronName),
    rename: (rootPath,atomName, electronId, newElectronName) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_RENAME, rootPath, atomName, electronId, newElectronName),
    delete: (rootPath, atomName, electronId) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_DELETE, rootPath, atomName, electronId),
  },
  atom:{
    create: (rootPath: string, name: string, domainName:string|null, content: AtomCreatePayload)=>ipcRenderer.invoke(IPC_CHANNELS.ATOM_CREATE, rootPath, name, domainName, content),
    delete: (rootPath: string, name: string)=>ipcRenderer.invoke(IPC_CHANNELS.ATOM_DELETE, rootPath, name),
    rename: (rootPath: string, oldAtomName: string, newAtomName: string)=>ipcRenderer.invoke(IPC_CHANNELS.ATOM_RENAME, rootPath, oldAtomName, newAtomName)
  },
  study:{
    read:(rootPath, atomName, electronId)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_READ, rootPath, atomName, electronId),
    add:(rootPath, atomName, electronId, content, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_ADD, rootPath, atomName, electronId, content, target),
    delete:(rootPath, atomName, electronId, targetId, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_DELETE, rootPath, atomName, electronId, targetId, target),
    edit: (rootPath, atomName, electronId, targerId, content, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_EDIT, rootPath, atomName, electronId, targerId, content, target )
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