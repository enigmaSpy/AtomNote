import { useWorldlineStore } from "@renderer/store/worldlineStore";

export const useActiveAtomName = () => useWorldlineStore((state)=>{
    const {atomId} = state.atomPointer;
    if(!atomId) return undefined;
    return state.worldlineData?.worldline.atoms[atomId]?.name
});
 
