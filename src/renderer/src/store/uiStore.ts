import type { AtomId, ElectronId } from "@shared/schemas/ids";
import { create } from "zustand";

export type ContextMenuTarget =
    | {
        type: "atom";
        atomId: AtomId;
    }
    | {
        type: "electron";
        atomId: AtomId;
        electronId: ElectronId;
    };

export interface ContextMenuState {
    x: number;
    y: number;
    target: ContextMenuTarget;
}
interface UIStoreActions{
    //Atom Modal
    setIsCreateAtomOpen: (isOpen: boolean)=>void;

    //GlobalContextMenu
    openContextMenu: (payload: Omit<ContextMenuState, 'isOpen'>) => void;
    closeContextMenu: () => void;

    //target edycji
    setEditingAtomId: (atomId: AtomId|null)=>void;
    setEditingElectronRef: (electronRef: ElectronRef | null)=>void;
}
type ElectronRef = {
    atomId: AtomId,
    electronId: ElectronId
}
interface UIState{
    contextMenu: ContextMenuState|null;
    isCreateAtomOpen: boolean;
    editingAtomId: AtomId|null;
    editingElectron: ElectronRef | null;
    actions: UIStoreActions;
}

export const useUIStore = create<UIState>((set)=>({
    contextMenu: null,
    isCreateAtomOpen: false,
    editingAtomId: null,
    editingElectron: null,
    actions: {
        setIsCreateAtomOpen: (isOpen) =>
            set({ isCreateAtomOpen: isOpen }),

        openContextMenu: (payload) =>
            set({ contextMenu: payload }),

        closeContextMenu: () =>{

            set({ contextMenu: null });
        },
            

        setEditingAtomId: (atomId) => set({editingAtomId: atomId}),
        setEditingElectronRef: (electronRef)=> set({editingElectron: electronRef}),
    }
}));

export const useUIActions =()=> useUIStore(state => state.actions);