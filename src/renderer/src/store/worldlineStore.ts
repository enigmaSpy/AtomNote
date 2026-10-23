import type { ParsedWorldline } from '@shared/domain/types';
import type { AtomMeta } from '@shared/schemas/atom';
import type { AtomId, ElectronId } from '@shared/schemas/ids';
import { create } from 'zustand';

interface WorldlineStoreActions{
    loadWorldline: (rootPath: string)=> Promise<void>;
    selectElectron: (atomId: AtomId ,electronId: ElectronId | null)=>void;
    selectAtom: (atomId: AtomId | null)=>void;
    clearWorldline: ()=>void;
    setPath: (rootPath: string, atomName:string)=>Promise<void>

    createAtom: (atomContent:Omit<AtomMeta, 'id'|'createdAt'|'updatedAt'>, atomName:string)=>void;
    deleteAtom: ( atomId: AtomId)=>void;
    renameAtom: (atomId:AtomId, newAtomName: string)=>void;
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
        createAtom: async(atomContent, atomName) => {
            const rootPath = get().worldlineData?.worldline.rootPath;
            if (!rootPath) return;
            
            const createStatus = await window.api.atom.create(rootPath, atomName, atomContent);
            if(createStatus.status === 'error'){
                set({error:createStatus.message});
                return;
            }
            const newAtomData = {
                name: atomName,
                meta: createStatus.data,
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
                return {
                    error: null,
                    worldlineData:{
                        ...state.worldlineData,
                        worldline:{
                            ...state.worldlineData.worldline,
                            atoms:{
                                ...state.worldlineData.worldline.atoms,
                                [createStatus.data.id]:newAtomData
                            }
                        }
                    }
                };
            })
        },
        deleteAtom:async(atomId)=> {
            const {worldlineData} = get();
            if (!worldlineData?.worldline.atoms[atomId]) return;
            const rootPath = worldlineData.worldline.rootPath;
            const atomName = worldlineData.worldline.atoms[atomId].name;
            if(!rootPath) return;
            const deleteStatus = await window.api.atom.delete(rootPath, atomName);

            if(deleteStatus.status !== 'ok'){
                set({
                    error: deleteStatus.message
                });
            }else{
                set((state)=>{
                    if(!state.worldlineData) return state;
                    const {[atomId]:_,...rest}=state.worldlineData.worldline.atoms;
                    if(state.activeAtomId === atomId){
                        return {
                        error: null,
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
                        error: null,
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
        },
        renameAtom: async(atomId, newAtomName)=>{
            const { worldlineData } = get();
            const rootPath = worldlineData?.worldline.rootPath;
            const oldAtomName = worldlineData?.worldline.atoms[atomId]?.name;
            if (!rootPath || !oldAtomName) return;
            
            const renameStatus = await window.api.atom.rename(rootPath, oldAtomName, newAtomName);
            if(renameStatus.status === 'error'){
                set({error: renameStatus.message});
            }else{
                set((state)=>{
                    if(!state.worldlineData) return state;
                    const atom = state.worldlineData.worldline.atoms[atomId];
                    if (!atom) return state;
                    const updatedAtom = {
                        ...atom,
                        name: newAtomName
                    }
                    return{
                        error: null,
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
        },

        setPath:async (rootPath, atomName)=>{
            const path = await window.api.helpers.getPath(rootPath, atomName);
            set({
                currentPath: path
            })
        }
    }
}));

export const useWorldlineActions = ()=> useWorldlineStore((state)=>state.actions);