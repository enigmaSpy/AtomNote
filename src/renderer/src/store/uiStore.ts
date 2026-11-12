import type { AtomId, ElectronId } from "@shared/schemas/ids";
import { create } from "zustand";

export type ModalType = 'createAtom' | 'flashcardsSession' | 'quizzesSession' | null;
export type SidePanelView = 'meta' | 'flashcardsPreview' | 'quizzesPreview';
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

    setModalType: (type:ModalType)=> void;
    setSidePanel: (type: SidePanelView)=>void;

    openContextMenu: (payload: ContextMenuState) => void;
    closeContextMenu: () => void;

    setEditingAtomId: (atomId: AtomId|null)=>void;
    setEditingElectronRef: (electronRef: ElectronRef | null)=>void;
    setCreatingElectron:(atomId: AtomId|null)=>void;
}
type ElectronRef = {
    atomId: AtomId,
    electronId: ElectronId
}
interface UIState{
    contextMenu: ContextMenuState|null;
    activeModal: ModalType;
    sidePanel: SidePanelView;

    editingAtomId: AtomId|null;
    editingElectron: ElectronRef | null;
    creatingElectron: AtomId | null;
    actions: UIStoreActions;
}

export const useUIStore = create<UIState>((set)=>({
    activeModal: null,
    sidePanel: 'meta',
    contextMenu: null,
    isCreateAtomOpen: false,
    editingAtomId: null,
    editingElectron: null,
    creatingElectron: null,
    actions: {
        
        setModalType:(type)=>set({
            activeModal: type
        }),
        setSidePanel:(type)=>set({
            sidePanel: type
        }),
        openContextMenu: (payload) =>set({ 
            contextMenu: payload 
        }),
        closeContextMenu: () =>set({ 
            contextMenu: null 
        }),
            
        setEditingAtomId: (atomId) => set({editingAtomId: atomId}),
        setEditingElectronRef: (electronRef)=> set({editingElectron: electronRef}),
        setCreatingElectron:(atomId)=>set({creatingElectron: atomId})
    }
}));

export const useUIActions =()=> useUIStore(state => state.actions);