import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { useEffect, useState } from "react";

export const ElectronContext = () => {
    const activeElectronId = useWorldlineStore(state=>(state.activeElectronId));
    const activeAtomId = useWorldlineStore(state=>(state.activeAtomId));
    const worldlineData = useWorldlineStore(state =>(state.worldlineData));
    
    const [electronContext, setElectronContext] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(()=>{
        let isCancelled = false;

        const loadElectronContext = async()=>{
            if(!activeAtomId || !activeElectronId || !worldlineData){
                setElectronContext("");
                return;
            }
            const currentAtom = worldlineData?.worldline.atoms
                        .find((atom)=>atom.id===activeAtomId);
            if(!currentAtom) return;

            const currentElectronName = currentAtom?.electrons
                        .find((electron)=>electron.id===activeElectronId);
            if(!currentElectronName)return;
                        
            try {
                const context = await window.api.electron.read(
                    worldlineData?.worldline.rootPath,
                    currentAtom.name,
                    currentElectronName.filename
                );
                if(!isCancelled){
                    setElectronContext(context ?? "");
                }
            } catch (error) {
                if(!isCancelled){
                    setElectronContext(`Błąd odczytu notatki: ${(error as Error).message}`);
                }
            }finally{
                if(!isCancelled){
                    setIsLoading(false);
                }
            }
        }
        void loadElectronContext();
        return ()=>{
            isCancelled=true;
        }
    },[ activeElectronId, worldlineData])                       
    
    if (!activeElectronId) {
        return <div className="p-4 text-gray-400">Widok Grafu</div>;
    }
    if (isLoading) {
        return <div className="p-4">Wczytywanie Elektronu...</div>;
    }
    return (
        <article className="p-6 prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans">{electronContext}</pre>
        </article>
    );
};
