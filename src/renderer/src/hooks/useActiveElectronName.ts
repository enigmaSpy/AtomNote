import { useWorldlineStore } from "@renderer/store/worldlineStore";

export const useActiveElectronName = () => useWorldlineStore((state)=>{
    const {atomId, electronId} = state.atomPointer;
    if(!atomId || !electronId) return undefined;
    const filename =  state.worldlineData?.worldline.atoms[atomId]?.electrons[electronId]?.filename;
    if(!filename) return undefined;
    return filename.replace(/\.[^/.]+$/, "");
})
