import { create } from "zustand";

type ContextMenuPayload ={
    isOpen: boolean;
    x: number;
    y: number;
    targetId: string | null;
    targetType: 'atom' | 'electron' | null;
} 

interface UIStoreActions{
    setCreateAtomOpen: (isOpen: boolean)=>void;
    openContextMenu: (x: number, y: number, targetId: string, targetType: 'atom' | 'electron')=>void;
    closeContextMenu: () => void;
}

interface UIState{
    contextMenu: ContextMenuPayload;

    isCreateAtomOpen: boolean;
    actions: UIStoreActions;
}

export const useUIStore = create<UIState>((set)=>({
    contextMenu: {
        isOpen: false,
        x: 0,
        y: 0,
        targetId: null,
        targetType: null
    },
    isCreateAtomOpen: false,
    actions:{
        setCreateAtomOpen:(isOpen)=> set({isCreateAtomOpen: isOpen}),
        openContextMenu:(x,y,targetId, targetType)=>set({
            contextMenu: {isOpen: true, x, y, targetId, targetType}
        }),
        closeContextMenu:()=>set({
            contextMenu:{
                isOpen: false, x: 0, y:0,targetId: null, targetType:null
            }
        })
    }
}));

export const useUIActions =()=> useUIStore(state => state.actions);