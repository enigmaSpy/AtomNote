import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type { IpcApi } from '../shared/ipc-contract'

const api: IpcApi = {
  worldline: {
    parse: (rootPath) => ipcRenderer.invoke(IPC_CHANNELS.WORLDLINE_PARSE, rootPath),
    //create()

    assignDomain: (rootPath, domainName) => ipcRenderer.invoke(IPC_CHANNELS.WORDLINE_ASSIGNDOMAIN, rootPath, domainName),
  },
  electron:{
    read: (rootPath, atomName, filename) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_READ,  rootPath, atomName, filename),
    save: (rootPath, atomName, filename, content) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_SAVE,  rootPath, atomName, filename, content),
    create: (rootPath, atomName, electronName) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_CREATE, rootPath, atomName, electronName),
    rename: (rootPath,atomName, electronId, newElectronName) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_RENAME, rootPath, atomName, electronId, newElectronName),
    delete: (rootPath, atomName, electronId) => ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_DELETE, rootPath, atomName, electronId),
    setTags: (rootPath, atomName, electronId, tagNames)=> ipcRenderer.invoke(IPC_CHANNELS.ELECTRON_SETTAGS, rootPath, atomName, electronId, tagNames),
  },
  atom:{
    create: (rootPath, name, domainName, content)=>ipcRenderer.invoke(IPC_CHANNELS.ATOM_CREATE, rootPath, name, domainName, content),
    delete: (rootPath, name)=>ipcRenderer.invoke(IPC_CHANNELS.ATOM_DELETE, rootPath, name),
    rename: (rootPath, oldAtomName, newAtomName)=>ipcRenderer.invoke(IPC_CHANNELS.ATOM_RENAME, rootPath, oldAtomName, newAtomName)
  },
  study:{
    read:(rootPath, atomName, electronId)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_READ, rootPath, atomName, electronId),
    add:(rootPath, atomName, electronId, payload)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_ADD, rootPath, atomName, electronId, payload),
    delete:(rootPath, atomName, electronId, targetId, target)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_DELETE, rootPath, atomName, electronId, targetId, target),
    edit: (rootPath, atomName, electronId, targetId, payload)=>ipcRenderer.invoke(IPC_CHANNELS.STUDY_EDIT, rootPath, atomName, electronId, targetId, payload)
  },
  helpers:{
    getPath: (rootPath, atomName)=>ipcRenderer.invoke(IPC_CHANNELS.HELPERS_GETPATH, rootPath, atomName),
  }
}

try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error('preload: exposeInMainWorld nie powiodło się', error)
}