import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { useEffect, useRef, useState } from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useDebounce } from "@renderer/hooks/useDebounce";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "../../assets/noteView.css";
/**
 *  Widk notatki, pozwala edytować oraz wyświetlać notatkę
 * 
 * @returns zwraca widok notatki
 */
export const NoteEditor = () => {
    const activeElectronId = useWorldlineStore(state=>(state.activeElectronId));
    const activeAtomId = useWorldlineStore(state=>(state.activeAtomId));
    const worldlineData = useWorldlineStore(state =>(state.worldlineData));

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [content, setContent] = useState<string>("");
    const [pathObj, setPathObj] = useState({
        rootPath: "",
        atomName: "",
        filename: ""
    });
    const debounceContent = useDebounce(content, 500);
    const currentNoteRef = useRef({ pathObj, content });
    useEffect(() => {
        currentNoteRef.current = { pathObj, content };
    }, [pathObj, content]);
    
    //?Load content from memory
    useEffect(()=>{
        let isCancelled = false;
        setIsLoading(true);
        (async()=>{
            if(!activeAtomId || !activeElectronId || !worldlineData){
                return;
            }
            const currentAtom = worldlineData?.worldline.atoms
                        .find((atom)=>atom.id===activeAtomId);
            if(!currentAtom) return;

            const currentElectron = currentAtom?.electrons
                        .find((electron)=>electron.id===activeElectronId);
            if(!currentElectron)return;
            const rootPath = worldlineData.worldline.rootPath;          
            try {
                const savedContext = await window.api.electron.read(
                    rootPath,
                    currentAtom.name,
                    currentElectron.filename
                );
                
                if (!isCancelled) {
                    setContent(savedContext);
                    setPathObj({
                        rootPath,
                        atomName: currentAtom.name,
                        filename: currentElectron.filename,
                    });
                }
            } catch (error) {
                if (!isCancelled) {
                    setContent(`Błąd odczytu notatki: ${(error as Error).message}`);
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        })();

        return () => {
            isCancelled = true;
            const { pathObj: oldPath, content: oldContent } = currentNoteRef.current;
            if (oldPath.filename) {
                window.api.electron.save(oldPath.rootPath, oldPath.atomName, oldPath.filename, oldContent)
                    .catch((err) => console.error(`[Flush Save Error]:`, err));
            }
        };
    }, [activeElectronId, activeAtomId, worldlineData]);
    

    //?background save cache
    useEffect(() => {
        if (!pathObj.filename || isLoading) return;

        window.api.electron
            .save(pathObj.rootPath, pathObj.atomName, pathObj.filename, debounceContent)
            //.then(() => console.log(`[Auto-save] Zapisano cache dla ${pathObj.filename}`))
            //.catch((err) => console.error(`[Auto-save Error]:`, err));
    }, [debounceContent]);
    
    if (!activeElectronId) {
        return <div className="p-4 text-gray-400">Widok Grafu</div>;
    }
    if (isLoading) {
        return <div className="p-4">Wczytywanie Elektronu...</div>;
    }
    return (
        <div>
            <button onClick={()=>setIsEditMode((prev)=>!prev)}>{isEditMode?"Podgląd":"Edycja"}</button>
            {isEditMode?(
                <div className="editorReadMode">   
                    <Markdown
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        disallowedElements={['input']}
                        //components={}
                    >{/*//TODO : remarkGfm odpala linki, do ogarnięcia + custom components*/} 
                        {content}
                    </Markdown>
                </div>
            ):(
                <ReactCodeMirror
                    value={content}
                    height="100%"
                    extensions={[markdown()]}
                    onChange={
                        (value)=>{
                            setContent(value);
                        }
                    }
                    className="h-full text-base font-mono"
                    theme='dark'
                />
            )}
        </div>
    );
};
