import type { ParsedWorldline } from '@shared/domain/types';
import type { AtomId, ElectronId } from '@shared/schemas/ids';
import {create} from 'zustand';

interface WorldlineStoreActions{
    loadWorldline: (rootPath: string)=> Promise<void>;
    selectElectron: (atomId: AtomId ,electronId: ElectronId | null)=>void;
    selectAtom: (atomId: string | null)=>void;
    clearWorldline: ()=>void;
    setPath: (rootPath: string, atomName:string)=>Promise<void>
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
        setPath:async (rootPath, atomName)=>{
            const path = await window.api.helpers.getPath(rootPath, atomName);
            set({
                currentPath: path
            })
        }
    }
}));

export const useWorldlineActions = ()=> useWorldlineStore((state)=>state.actions);

interface WorldlineState {
    isCreateAtomOpen: boolean;
    setCreateAtomOpen: (isOpen: boolean) => void;
}

export const useWorldlineState = create<WorldlineState>((set)=>({
    isCreateAtomOpen: false,
    setCreateAtomOpen: (isOpen)=> set({isCreateAtomOpen: isOpen}),
}));