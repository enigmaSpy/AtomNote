import type { AtomView, DomainsDict, ElectronView, ParsedWorldline, Status } from '@shared/domain/types';
import type { AtomMeta } from '@shared/schemas/atom';
import type { AtomId, ElectronId } from '@shared/schemas/ids';
import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

enableMapSet();

type CreateAtomOutput = {
    atomMeta: AtomMeta
    domain: DomainsDict | null
}
export type AtomPointer =
    |{
        atomId: AtomId,
        electronId: ElectronId
    }|{
        atomId: AtomId,
        electronId: null
    }
    |{
        atomId: null,
        electronId: null
    }
interface WorldlineStoreActions{
    loadWorldline: (rootPath: string)=> Promise<void>;
    //assignDomain: (domainName: string)=>Promise<ActionStatus>;

    createAtom: (atomContent:Omit<AtomMeta, 'id'|'domainId'|'createdAt'|'updatedAt'>, atomName:string, domainName: string|null)=>Promise<Status>;
    deleteAtom: (atomId: AtomId)=>Promise<Status>;
    renameAtom: (atomId:AtomId, newAtomName: string)=>Promise<Status>;

    createElectron: (atomId: AtomId, electronName: string)=>Promise<Status>;
    deleteElectron: (atomId: AtomId, electronId: ElectronId)=>Promise<Status>;
    renameElectron: (atomId: AtomId, electronId: ElectronId, newElectronName:string)=>Promise<Status>;

    
    setAtomPointer: (pointer:AtomPointer)=>void;

    clearWorldline: ()=>void;
    clearError: ()=>void;
}
interface WorldlineStore{
    worldlineData: ParsedWorldline | null;
    isLoading: boolean;
    atomPointer: AtomPointer;
    error: string|null;

    actions: WorldlineStoreActions;
}

export const useWorldlineStore = create<WorldlineStore>()(immer((set, get)=>({
    worldlineData: null,
    isLoading: false,
    atomPointer: {
        atomId: null,
        electronId: null
    },
    error: null,
    
    actions:{
        loadWorldline: async (rootPath: string)=>{
            set({isLoading:true, error:null})
            try {
                const parsed = await window.api.worldline.parse(rootPath);
                set({
                    worldlineData: parsed,
                    atomPointer:{
                        atomId: null,
                        electronId: null
                    }
                });
            } catch (error) {
                set({
                    worldlineData: null ,
                    error: (error as Error).message,
                    atomPointer:{
                        atomId: null,
                        electronId: null
                    }
                });
            }finally{
                set({isLoading:false})
            }
        },
        setAtomPointer: (pointer)=> {
            const {worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath;
            if (!rootPath) return;
            set({
                atomPointer: pointer
            });
        },
        clearWorldline: ()=>set({
            worldlineData: null,
            atomPointer: {
                atomId: null,
                electronId: null
            },
            isLoading: false,
            error: null,
        }),
        
        createAtom: async(atomContent,atomName,domainName) => {
            const rootPath = get().worldlineData?.worldline.rootPath;
            if (!rootPath) {
                return {
                    status: 'error',
                    code: 'ERR_ROOT_PATH_MISSING'
                };
            }

            const createStatus =await window.api.atom.create(rootPath, atomName, domainName, atomContent);
            if (createStatus.status === 'error') {
                return createStatus;
            }
            
            if (!createStatus.data) return {
                status: 'error',
                code: 'ERR_ATOM_READ_FAILED'
            };
            const {atomMeta, domain}: CreateAtomOutput = createStatus.data;

            const newAtomData: AtomView = {
                name: atomName,
                meta: atomMeta,
                tags: new Set<string>(),
                mastery: 0,
                electrons: {},
                references: {
                    referencedAtoms: [],
                    referencedElectrons: {}
                },
                links: {}
            };
            set((state) => {
                if (!state.worldlineData) return;
                if (state.worldlineData.worldline.rootPath!== rootPath) return;
                state.error = null;
                state.worldlineData.worldline.atoms[atomMeta.id] = newAtomData;
                if (domain) {
                    Object.assign(state.worldlineData.worldline.domains,domain);
                }
            });
            return { status: 'ok' };
        },

        deleteAtom:async(atomId)=> {
            const {worldlineData} = get();
            if (!worldlineData?.worldline.atoms[atomId]) return {
                status:'error', 
                code: 'ERR_ATOM_READ_FAILED'
            };
            const rootPath = worldlineData.worldline.rootPath;
            const atomName = worldlineData.worldline.atoms[atomId].name;
            if (!rootPath) return {
                status:'error', 
                code: 'ERR_ROOT_PATH_MISSING'
            };
            const deleteStatus = await window.api.atom.delete(rootPath, atomName);

            if(deleteStatus.status === 'error'){
                return deleteStatus;
            }else{
                set((state)=>{
                    if(state.worldlineData?.worldline.rootPath !== rootPath) return;
                    delete state.worldlineData.worldline.atoms[atomId];
                    if(state.atomPointer.atomId === atomId){
                        state.atomPointer={
                            atomId: null,
                            electronId: null,
                        }
                    }
                })
            }
            return {status: 'ok'}
        },

        renameAtom: async(atomId, newAtomName)=>{
            const { worldlineData } = get();
            const rootPath = worldlineData?.worldline.rootPath;
            const oldAtomName = worldlineData?.worldline.atoms[atomId]?.name;
            if (!rootPath) return {
                status:'error', 
                code: 'ERR_ROOT_PATH_MISSING'
            }
            if(!oldAtomName)return{
                status: 'error',
                code: 'ERR_ATOM_NOT_FOUND'
            }
            
            const renameStatus = await window.api.atom.rename(rootPath, oldAtomName, newAtomName);
            if(renameStatus.status === 'error'){
                return renameStatus;
            }else{
                set((state)=>{
                    if(!state.worldlineData) return;
                    if(state.worldlineData.worldline.rootPath !== rootPath) return;             
                    const atom = state.worldlineData.worldline.atoms[atomId];
                    if (!atom) return;
                    atom.name = newAtomName;
                })
            }
            return {status: 'ok'}
        },

        createElectron: async(atomId, electronName)=>{
            const { worldlineData } = get();

            const rootPath = worldlineData?.worldline.rootPath;
            const atomName = worldlineData?.worldline.atoms[atomId]?.name;

            if (!rootPath) return {
                status:'error', 
                code: 'ERR_ROOT_PATH_MISSING'
            }
            if(!atomName)return{
                status: 'error',
                code: 'ERR_ATOM_NOT_FOUND'
            }
            const createResult = await window.api.electron.create(rootPath, atomName, electronName);
            if(createResult.status === 'error') return createResult;
            set((state)=>{
                if(!state.worldlineData) return;
                if(state.worldlineData.worldline.rootPath !== rootPath) return;      

                const atom = state.worldlineData.worldline.atoms[atomId];
                if(!atom) return;

                const entry = Object.entries(createResult.data).at(0);
                if(!entry) return;
                const [rawId, electronMeta] = entry;
                const electronId = rawId as ElectronId;

                const newElectron: ElectronView = {
                    ...electronMeta,
                    id: electronId,
                    ownerAtomId: atomId
                }
                atom.electrons[electronId] = newElectron;
            });
            return {status: 'ok'}
        },

        deleteElectron: async(atomId, electronId)=>{
            const {worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath;
            if (!rootPath) return {
                status:'error', 
                code: 'ERR_ROOT_PATH_MISSING'
            }
            
            const atom = worldlineData.worldline.atoms[atomId];
            if(!atom)return{
                status: 'error',
                code: 'ERR_ATOM_NOT_FOUND'
            }
            const electron = atom.electrons[electronId];
            if(!electron) return {
                status: "error", 
                code: 'ERR_ELECTRON_NOT_FOUND'
            }
            const deleteResult = await window.api.electron.delete(rootPath, atom.name, electronId);
            if(deleteResult.status === 'error'){
                return deleteResult;
            }else{
                set((state)=>{
                    if(state.worldlineData?.worldline.rootPath !== rootPath) return;
                    const atom = state.worldlineData.worldline.atoms[atomId];
                    if(!atom) return;
                    if(state.atomPointer.electronId === electronId && state.atomPointer.atomId === atomId){
                        state.atomPointer ={atomId: atomId, electronId: null}
                    }
                    delete atom.electrons[electronId];
                })
            }
            return {status: 'ok'}
        },

        renameElectron: async(atomId, electronId, newElectronName)=>{
            const {worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath;
            if (!rootPath) return {
                status:'error', 
                code: 'ERR_ROOT_PATH_MISSING'
            }
            const atom = worldlineData.worldline.atoms[atomId];
            if(!atom) return {
                status: 'error',
                code: 'ERR_ATOM_NOT_FOUND'
            }
            const renameResult = await window.api.electron.rename(rootPath, atom.name, electronId, newElectronName);
            if(renameResult.status === 'error'){
                return renameResult;
            }else{
                set((state)=>{
                    const currentAtom = state.worldlineData?.worldline.atoms[atomId];
                    const currentElectron = currentAtom?.electrons[electronId];

                    if(!currentElectron) return;
                    currentElectron.filename = renameResult.data;
                })
            }
            return {status: 'ok'}
        },

        clearError:()=>set({error:null}),  
    },
    
})
));

export const useWorldlineActions = ()=> useWorldlineStore((state)=>state.actions);
