import { useWorldlineStore } from "@renderer/store/worldlineStore";
import type { AtomId, ElectronId } from "@shared/schemas/ids";

interface Data {
    atomName: string | null;
    electronName: string | null;
}
/**
 * 
 * @returns nazwę obecnego Elektona/Atomu
 */
export function getCurrentFileName(): Data {
    const state = useWorldlineStore.getState();

    const activeAtomId = state.activeAtomId as AtomId | null;
    const activeElectronId = state.activeElectronId as ElectronId | null;

    const currentAtom = activeAtomId ? 
        state.worldlineData?.worldline.atoms[activeAtomId] ?? null: null;
    
    const currentElectron = activeAtomId&&activeElectronId?
        currentAtom?.electrons[activeElectronId]??null:null;
    
    return {
        atomName: currentAtom?.name ?? null,
        electronName: currentElectron?.filename ?? null
    };
}