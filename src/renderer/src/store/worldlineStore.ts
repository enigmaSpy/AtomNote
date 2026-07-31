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

export const useWorldlineStore = create<WorldlineStore>((set)=>({
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
                set({ worldlineData: null , error: (error as Error).message});
            }finally{
                set({isLoading:false})
            }
        },

        selectAtom: (atomId)=> set({activeAtomId: atomId,activeElectronId:null}),
        selectElectron: (electronId)=> set({activeElectronId: electronId}),
        clearWorldline: ()=>set({
            worldlineData: null,
            activeAtomId: null,
            activeElectronId: null
        })
    }
}))