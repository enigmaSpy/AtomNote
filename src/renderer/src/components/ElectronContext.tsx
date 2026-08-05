import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { useCallback, useEffect, useState } from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";

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
    },[ activeElectronId, worldlineData]);
    
    const handleChange = useCallback((value:string)=>{
        setElectronContext(value)
    },[])
    
    if (!activeElectronId) {
        return <div className="p-4 text-gray-400">Widok Grafu</div>;
    }
    if (isLoading) {
        return <div className="p-4">Wczytywanie Elektronu...</div>;
    }
    return (
        <div className="p-6 prose dark:prose-invert max-w-none">
            <ReactCodeMirror
                value={electronContext}
                height="100%"
                extensions={[markdown()]}
                onChange={handleChange}
                className="h-full text-base font-mono"
                theme='dark'
            />
        </div>
    );
};
