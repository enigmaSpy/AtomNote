import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { useEffect, useRef, useState } from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useDebounce } from "@renderer/hooks/useDebounce";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "./NoteEditor.module.css";
import { getCurrentFileName } from "@renderer/utils/currentFileName";
/**
 *  Widk notatki, pozwala edytować oraz wyświetlać notatkę
 * 
 * @returns zwraca widok notatki
 */
export const NoteEditor = () => {
    const activeElectronId = useWorldlineStore(state=>(state.activeElectronId));
    const activeAtomId = useWorldlineStore(state=>(state.activeAtomId));
    const worldlineData = useWorldlineStore(state =>(state.worldlineData));

    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
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
        if(!activeAtomId || !activeElectronId || !worldlineData){
                setIsLoading(false)
                return;
            }
        let isCancelled = false;
        setIsLoading(true);
        (async()=>{
            
            
            const {atomName: currentAtom, electronName:currentElectron} = getCurrentFileName();
            if (!currentAtom || !currentElectron) {
                if (!isCancelled) setIsLoading(false);
                return;
            }
            const rootPath = worldlineData.worldline.rootPath;          
            try {
                const savedContext = await window.api.electron.read(
                    rootPath,
                    currentAtom,
                    currentElectron
                );
                
                if (!isCancelled) {
                    setContent(savedContext);
                    setPathObj({
                        rootPath,
                        atomName: currentAtom,
                        filename: currentElectron,
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
    
    useEffect(() => {
        if (!pathObj.filename || isLoading) return;

        window.api.electron
            .save(pathObj.rootPath, pathObj.atomName, pathObj.filename, debounceContent)
    }, [debounceContent]);
    
    if (!activeElectronId) {
        return <div className="p-4 text-gray-400">Widok Grafu</div>;
    }
    
    if (isLoading) {
        return <div className="p-4">Wczytywanie Elektronu...</div>;
    }
    return (
        <div className="flex-2">
            <button onClick={()=>setIsPreviewMode((prev)=>!prev)}>{isPreviewMode?"Podgląd":"Edycja"}</button>
            {isPreviewMode?(
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
