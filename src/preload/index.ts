import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type { IpcApi } from '../shared/ipc-contract'
import type { AtomMeta } from '@shared/schemas/atom'
import type { AtomCreatePayload } from '@main/services/atom/atom-create'

const api: IpcApi = {
  worldline: {
    parse: (rootPath) => ipcRenderer.invoke(IPC_CHANNELS.WORLDLINE_PARSE, rootPath),
    //create()

    addDomain: (rootPath, domainName) => ipcRenderer.invoke(IPC_CHANNELS.WORDLINE_ADDDOMAIN, rootPath, domainName),
  },
  electron:{
    read: (path:string, filename:string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_READ, path, filename),
    save: (path:string, filename:string, content: string) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_SAVE, path, filename, content),
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
    read:(path, electronId)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_READ, path, electronId),
    add:(path, electronId, content, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_ADD, path, electronId, content, target),
    delete:(path, electronId, targetId, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_DELETE, path, electronId, targetId, target),
    edit: (path, electronId, targerId, content, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_EDIT, path, electronId, targerId, content, target )
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