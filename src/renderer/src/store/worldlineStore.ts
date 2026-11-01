import type { AtomView, DomainsDict, ElectronView, ParsedWorldline } from '@shared/domain/types';
import type { AtomMeta } from '@shared/schemas/atom';
import type { AtomId, DomainId, ElectronId } from '@shared/schemas/ids';
import { create } from 'zustand';

export type ActionStatus<T = void> = 
    | (T extends void? { status: 'ok' } : { status: 'ok', data: T})
    | { status: 'error'; message: string };
type CreateAtomOutput = {
    atomMeta: AtomMeta
    domain: DomainsDict | null
}
interface WorldlineStoreActions{
    loadWorldline: (rootPath: string)=> Promise<void>;
    addDomain: (domainName: string)=>Promise<ActionStatus>;

    createAtom: (atomContent:Omit<AtomMeta, 'id'|'domainId'|'createdAt'|'updatedAt'>, atomName:string, domainName: string|null)=>Promise<ActionStatus>;
    deleteAtom: (atomId: AtomId)=>Promise<ActionStatus>;
    renameAtom: (atomId:AtomId, newAtomName: string)=>Promise<ActionStatus>;

    createElectron: (atomId: AtomId, electronName: string)=>Promise<ActionStatus>;
    deleteElectron: (atomId: AtomId, electronId: ElectronId)=>Promise<ActionStatus>;
    renameElectron: (atomId: AtomId, electronId: ElectronId, newElectronName:string)=>Promise<ActionStatus>

    selectAtom: (atomId: AtomId | null)=>void;
    selectElectron: (atomId: AtomId ,electronId: ElectronId | null)=>void;
    clearWorldline: ()=>void;
    setPath: (rootPath: string, atomName:string)=>Promise<void>
    clearError: ()=>void;
}
interface WorldlineStore{
    worldlineData: ParsedWorldline | null;
    isLoading: boolean;
    activeAtomId: string | null;
    activeElectronId: string | null;
    error: string|null;
    currentPath:string|null;

    actions: WorldlineStoreActions;
}
/**
 * Magazyn worldline
 */
export const useWorldlineStore = create<WorldlineStore>((set, get)=>({
    worldlineData: null,
    isLoading: false,
    activeAtomId: null,
    activeElectronId: null,
    error: null,
    currentPath: null,
    
    actions:{
        loadWorldline: async (rootPath: string)=>{
            set({isLoading:true, error:null})
            try {
                const parsed = await window.api.worldline.parse(rootPath);
                set({
                    worldlineData: parsed,
                    activeAtomId: null,
                    activeElectronId: null,
                });
            } catch (error) {
                set({
                    worldlineData: null ,
                    error: (error as Error).message,
                    activeAtomId: null,
                    activeElectronId: null,
                    currentPath: null
                    });
            }finally{
                set({isLoading:false})
            }
        },
        addDomain:async(domainName)=>{
            const {worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath
            if(!rootPath) return{
                status: 'error',
                message: 'Brak ścieżki głównek'
            }
            const addingResult = await window.api.worldline.assignDomain(rootPath, domainName);
            if(addingResult.status === 'error') return addingResult;
            const domainId = Object.keys(addingResult.data)[0] as DomainId;
            set((state)=>{
                if(!state.worldlineData) return state;
                return {
                    worldlineData:{
                        ...state.worldlineData,
                        worldline: {
                            ...state.worldlineData.worldline,
                            domains:{
                                ...state.worldlineData.worldline.domains,
                                ...addingResult.data
                            }
                        }
                    }
                }
            })
            return {status: 'ok', data: domainId}
        },
        selectAtom: (atomId)=> {
            const {activeAtomId} = get();
            set({
                activeAtomId: activeAtomId === atomId? null: atomId,
            }
        )},
        selectElectron: async(atomId,electronId)=> {
            const {activeElectronId,worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath;
            const atom = worldlineData?.worldline.atoms[atomId];

            if (!rootPath || !atom) return;
            const path = await window.api.helpers.getPath(rootPath, atom.name);
            
            set({
                activeAtomId: atomId,
                activeElectronId: electronId === activeElectronId? null: electronId,
                currentPath: path
            });
        },
        clearWorldline: ()=>set({
            worldlineData: null,
            activeAtomId: null,
            activeElectronId: null,
            isLoading: false,
            error: null,
            currentPath: null
        }),
        
        createAtom: async(atomContent, atomName, domainName) => {
            const rootPath = get().worldlineData?.worldline.rootPath;
            if (!rootPath) return {status:'error', message:"Brak ścieżki głównek"};
            
            const createStatus = await window.api.atom.create(rootPath, atomName, domainName, atomContent);
            if(createStatus.status === 'error'){
                return createStatus;
            }
            if(!('data' in createStatus)){
                return {status:'error', message:"Nieprawidłowa odpowiedź podczas tworzenia atomu"};
            }
            const {atomMeta, domain}:CreateAtomOutput = createStatus.data;
            
            const newAtomData:AtomView = {
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
            }
            set((state) =>{
                if(!state.worldlineData) return state;   
                if(state.worldlineData.worldline.rootPath !== rootPath) return state;             
                return {
                    error: null,
                    worldlineData:{
                        ...state.worldlineData,
                        worldline:{
                            ...state.worldlineData.worldline,
                            domains:{
                                ...state.worldlineData.worldline.domains,
                                ...domain
                            },
                            atoms:{
                                ...state.worldlineData.worldline.atoms,
                                [atomMeta.id]:newAtomData
                            }
                        }
                    }
                };
            });
            return {status:'ok'}
        },
        deleteAtom:async(atomId)=> {
            const {worldlineData} = get();
            if (!worldlineData?.worldline.atoms[atomId]) return {
                status:'error', 
                message:"Błąd - Wybrany Id atomu jest niepoprawne"
            };
            const rootPath = worldlineData.worldline.rootPath;
            const atomName = worldlineData.worldline.atoms[atomId].name;
            if (!rootPath) return {
                status:'error', 
                message:"Brak ścieżki głównek"
            };
            const deleteStatus = await window.api.atom.delete(rootPath, atomName);

            if(deleteStatus.status === 'error'){
                return deleteStatus;
            }else{
                set((state)=>{
                    if(!state.worldlineData) return state;
                    if(state.worldlineData.worldline.rootPath !== rootPath) return state;             
                    const {[atomId]:_,...rest}=state.worldlineData.worldline.atoms;
                    if(state.activeAtomId === atomId){
                        return {
                        activeAtomId:null,
                        activeElectronId: null,
                        worldlineData:{
                            ...state.worldlineData,
                            worldline:{
                                ...state.worldlineData.worldline,
                                atoms:{
                                    ...rest
                                }
                            }
                        }
                    };
                    }
                    return {
                        worldlineData:{
                            ...state.worldlineData,
                            worldline:{
                                ...state.worldlineData.worldline,
                                atoms:{
                                    ...rest
                                }
                            }
                        }
                    };
                })
            }
            return {status: 'ok'}
        },
        renameAtom: async(atomId, newAtomName)=>{
            const { worldlineData } = get();
            const rootPath = worldlineData?.worldline.rootPath;
            const oldAtomName = worldlineData?.worldline.atoms[atomId]?.name;
            if (!rootPath || !oldAtomName) return {
                status:'error', 
                message:"Brak ścieżki głównek lub Atom już nie istnieje"
            };
            
            const renameStatus = await window.api.atom.rename(rootPath, oldAtomName, newAtomName);
            if(renameStatus.status === 'error'){
                return renameStatus;
            }else{
                set((state)=>{
                    if(!state.worldlineData) return state;
                    if(state.worldlineData.worldline.rootPath !== rootPath) return state;             
                    const atom = state.worldlineData.worldline.atoms[atomId];
                    if (!atom) return state;
                    const updatedAtom = {
                        ...atom,
                        name: newAtomName
                    }
                    return{
                        worldlineData:{
                            ...state.worldlineData,
                            worldline:{
                                ...state.worldlineData.worldline,
                                atoms:{
                                    ...state.worldlineData.worldline.atoms,
                                    [atomId]: updatedAtom
                                }
                            }
                        }
                    }
                })
            }
            return {status: 'ok'}
        },

        createElectron: async(atomId, electronName)=>{
            const { worldlineData } = get();

            const rootPath = worldlineData?.worldline.rootPath;
            const atomName = worldlineData?.worldline.atoms[atomId]?.name;

            if (!rootPath || !atomName) return {
                status:'error', 
                message:"Brak ścieżki głównek/rodzica"
            };
            const createResult = await window.api.electron.create(rootPath, atomName, electronName);
            if(createResult.status === 'error'){
                return createResult;
            }else{
                set((state)=>{
                    if(!state.worldlineData) return state;
                    if(state.worldlineData.worldline.rootPath !== rootPath) return state;             
                    const atom = state.worldlineData.worldline.atoms[atomId];
                    if(!atom) return state;
                    const entry = Object.entries(createResult.data).at(0);
                    if(!entry) return state;
                    const [rawId, electronMeta] = entry;
                    const electronId = rawId as ElectronId;
                    const newElectron: ElectronView = {
                        ...electronMeta,
                        id: electronId,
                        ownerAtomId: atomId
                    }
                    const currentAtom = state.worldlineData.worldline.atoms[atomId];
                    if (!currentAtom) return state;
                    return{
                        worldlineData:{
                            ...state.worldlineData,
                            worldline:{
                                ...state.worldlineData.worldline,
                                atoms:{
                                    ...state.worldlineData.worldline.atoms,
                                    [atomId]:{
                                        ...currentAtom,
                                        electrons:{
                                            ...currentAtom.electrons,
                                            [electronId]:newElectron
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            return {status: 'ok'}
        },
        deleteElectron: async(atomId, electronId)=>{
            const {worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath;
            if(!rootPath) return {
                status: "error", message: 'brak aktywnej ścieżki'
            };
            const atom = worldlineData.worldline.atoms[atomId];
            if(!atom) return {
                status: "error", 
                message: "Atom zawierający Elektron już nie istnieje"
            }
            const electron = atom.electrons[electronId];
            if(!electron) return {
                status: "error", 
                message: "Elektron już nie istnieje"
            }
            const deleteResult = await window.api.electron.delete(rootPath, atom.name, electronId);
            if(deleteResult.status === 'error'){
                return deleteResult;
            }else{
                set((state)=>{
                    if(!state.worldlineData) return state;
                    if(state.worldlineData.worldline.rootPath !== rootPath) return state;             
                    const currentAtom = state.worldlineData?.worldline.atoms[atomId];
                    if(!currentAtom) return state;
                    
                    const {[electronId]:_, ...updatedElectrons} = currentAtom.electrons;
                    return{
                        worldlineData:{
                            ...state.worldlineData,
                            worldline:{
                                ...state.worldlineData.worldline,
                                atoms:{
                                    ...state.worldlineData.worldline.atoms,
                                    [atomId]:{
                                        ...currentAtom,
                                        electrons: updatedElectrons
                                    }
                                }
                            }
                        }
                    }
                })
            }
            return {status: 'ok'}
        },
        renameElectron: async(atomId, electronId, newElectronName)=>{
            const {worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath;
            if(!rootPath) return {
                status: "error", message: 'brak aktywnej ścieżki'
            };
            const atom = worldlineData.worldline.atoms[atomId];
            if(!atom) return {
                status: "error", 
                message: "Atom zawierający Elektron już nie istnieje"
            }
            const renameResult = await window.api.electron.rename(rootPath, atom.name, electronId, newElectronName);
            if(renameResult.status === 'error'){
                return renameResult;
            }else{
                set((state)=>{
                    if(!state.worldlineData) return state;
                    if(state.worldlineData.worldline.rootPath !== rootPath) return state;
                    const currentAtom = state.worldlineData.worldline.atoms[atomId];
                    const currentElectron = currentAtom?.electrons[electronId];
                    if (!currentAtom || !currentElectron) {
                        return state;
                    }
                    return {
                        worldlineData:{
                            ...state.worldlineData,
                            worldline:{
                                ...state.worldlineData.worldline,
                                atoms:{
                                    ...state.worldlineData.worldline.atoms,
                                    [atomId]:{
                                        ...currentAtom,
                                        electrons:{
                                            ...currentAtom.electrons,
                                            [electronId]: {
                                                ...currentElectron,
                                                filename: renameResult.data
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
            return {status: 'ok'}
        },
        clearError:()=>set({error:null}),
        setPath:async (rootPath, atomName)=>{
            const path = await window.api.helpers.getPath(rootPath, atomName);
            set({
                currentPath: path
            })
        }
    }
}));

export const useWorldlineActions = ()=> useWorldlineStore((state)=>state.actions);
