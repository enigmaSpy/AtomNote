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
    setIsCreateAtomOpen: (isOpen: boolean)=>void;
    openContextMenu: (payload: Omit<ContextMenuState, 'isOpen'>) => void;
    closeContextMenu: () => void;
}

interface UIState{
    contextMenu: ContextMenuState|null;

    isCreateAtomOpen: boolean;
    actions: UIStoreActions;
}

export const useUIStore = create<UIState>((set)=>({
    contextMenu: null,
    isCreateAtomOpen: false,

    actions: {
        setIsCreateAtomOpen: (isOpen) =>
            set({ isCreateAtomOpen: isOpen }),

        openContextMenu: (payload) =>
            set({ contextMenu: payload }),

        closeContextMenu: () =>
            set({ contextMenu: null })
    }
}));

export const useUIActions =()=> useUIStore(state => state.actions);