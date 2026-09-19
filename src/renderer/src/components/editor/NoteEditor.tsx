import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { useEffect, useRef, useState } from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useDebounce } from "@renderer/hooks/useDebounce";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styles from "./NoteEditor.module.css";
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
    const currentPath = useWorldlineStore(state => state.currentPath);

    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [content, setContent] = useState<string>("");
    
    const activeNames = getCurrentFileName();
    //const activeAtomName = activeNames.atomName;
    const activeElectronName = activeNames.electronName;
    
    const debounceContent = useDebounce(content, 500);

    const loadedNoteRef = useRef({path: "", file:"", content:""}); 
    useEffect(() => {
        if(loadedNoteRef.current.file){
            loadedNoteRef.current.content = content;
        }
    }, [content]);
    
    //?Load content from memory
    useEffect(()=>{
        if(!activeAtomId || !activeElectronId || !worldlineData || !activeElectronName ||!currentPath){
                setIsLoading(false)
                return;
            }
        let isCancelled = false;
        setIsLoading(true);

        const targetPath = currentPath;
        const targetFile = activeElectronName;
        (async()=>{
            
            try {
                const savedContext = await window.api.electron.read(
                    targetPath,
                    targetFile
                );
                if (!isCancelled) {
                    setContent(savedContext);
                    loadedNoteRef.current={
                        path: targetPath,
                        file: targetFile,
                        content: savedContext
                    }
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
            const {path: savePath, file:saveFile, content: saveContent} = loadedNoteRef.current;
            if (savePath && saveFile) {
                window.api.electron.save(savePath, saveFile, saveContent)
                    .catch((err) => console.error(`[Flush Save Error]:`, err));
            }
        };
    }, [activeElectronId]);
    
    useEffect(() => {
        const {path, file} = loadedNoteRef.current;
        if (!file || isLoading) return;

        window.api.electron
            .save(path, file, debounceContent)
            .catch(console.error);
    }, [debounceContent, isLoading]);
    
    if (isLoading) {
        return <div className="p-4">Wczytywanie Elektronu...</div>;
    }
    return (
        <div className={styles.noteWrapper}>
            <button className={styles.switchMode}
                onClick={()=>setIsPreviewMode((prev)=>!prev)}>{!isPreviewMode?"Podgląd":"Edycja"}
            </button>
            {isPreviewMode?(
                <div className={styles.previewMode}>   
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
                    className={styles.editMode}
                    height="95svh"
                    extensions={[markdown()]}
                    onChange={
                        (value)=>{
                            setContent(value);
                        }
                    }
                        
                    theme='light'
                />
            )}
        </div>
    );
};
