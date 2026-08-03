import type { ParsedWorldline } from '@shared/domain/types';
import {create} from 'zustand';

interface WorldlineStoreActions{
    loadWorldline: (rootPath: string)=> Promise<void>;
    selectElectron: (electronId: string | null)=>void;
    selectAtom: (atomId: string | null)=>void;
    clearWorldline: ()=>void;
}

interface WorldlineStore{
    worldlineData: ParsedWorldline | null;
    isLoading: boolean;
    activeAtomId: string | null;
    activeElectronId: string | null;
    error: string|null;

    actions: WorldlineStoreActions;
}

export const useWorldlineStore = create<WorldlineStore>((set, get)=>({
    worldlineData: null,
    isLoading: false,
    activeAtomId: null,
    activeElectronId: null,
    error: null,

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
                    activeElectronId: null
                    });
            }finally{
                set({isLoading:false})
            }
        },

        selectAtom: (atomId)=> {
            const {activeAtomId} = get();
            set({
                activeAtomId: activeAtomId === atomId? null: atomId,
                activeElectronId:null
            }
        )},
        selectElectron: (electronId)=> {
            const {activeElectronId} = get();
            set({activeElectronId: electronId === activeElectronId? null: electronId})
        },
        clearWorldline: ()=>set({
            worldlineData: null,
            activeAtomId: null,
            activeElectronId: null,
            isLoading: false,
            error: null
        })
    }
}));

export const useWorldlineActions = ()=> useWorldlineStore((state)=>state.actions);