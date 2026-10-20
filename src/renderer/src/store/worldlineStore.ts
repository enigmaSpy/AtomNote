import type { AtomView, ParsedWorldline } from '@shared/domain/types';
import type { AtomId, ElectronId } from '@shared/schemas/ids';
import {create} from 'zustand';

interface WorldlineStoreActions{
    loadWorldline: (rootPath: string)=> Promise<void>;
    selectElectron: (atomId: AtomId ,electronId: ElectronId | null)=>void;
    selectAtom: (atomId: AtomId | null)=>void;
    clearWorldline: ()=>void;
    setPath: (rootPath: string, atomName:string)=>Promise<void>

    addAtom: (newAtomId: AtomId, newAtomData:AtomView)=>void;
    deleteAtom: (atomName: string, atomId: AtomId)=>void;
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
        addAtom: (newAtomId, newAtomData) => set((state) =>{
            if(!state.worldlineData) return state;
            
            return {
                worldlineData:{
                    ...state.worldlineData,
                    worldline:{
                        ...state.worldlineData.worldline,
                        atoms:{
                            ...state.worldlineData.worldline.atoms,
                            [newAtomId]:newAtomData
                        }
                    }
                }
            };
        }),
        deleteAtom:async(atomName, atomId)=> {
            const {worldlineData} = get();
            const rootPath = worldlineData?.worldline.rootPath;
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