import { useWorldlineStore } from "@renderer/store/worldlineStore";

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

    const data: Data = {
        atomName: null,
        electronName: null
    };

    const currentAtom = state.worldlineData?.worldline.atoms
                        .find((atom) => atom.id === state.activeAtomId) ?? null;
    
    data.atomName = currentAtom?.name || null;

    const currentElectron = currentAtom?.electrons
                        .find((electron) => electron.id === state.activeElectronId);
                        
    data.electronName = currentElectron?.filename || null;
    
    return data;
}