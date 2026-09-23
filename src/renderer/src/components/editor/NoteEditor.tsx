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
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [content, setContent] = useState<string>("");

    const currentPath = useWorldlineStore(state=>state.currentPath);
    const electronId = useWorldlineStore(state =>state.activeElectronId);

    const currentElectronName = getCurrentFileName().electronName;
    const debounceContent = useDebounce(content, 500);

    const loadedElectronRef = useRef({
        path: '',
        electronName: '',
        content: ''
    });


    useEffect(()=>{
        const {path,electronName:name, content:payload} = loadedElectronRef.current;
        if (path && name && payload !== undefined) {
            window.api.electron.save(path, name, payload).catch(console.error);
        }
    },[debounceContent]);

    useEffect(()=>{
        if (!currentPath||!currentElectronName)return;        
        
        let isCancelled = false;
        const loadNewElectron=async()=>{
            setIsLoading(true);
            try {
                const targetPath = currentPath;
                const targetName = currentElectronName;

                const noteContent = await window.api.electron.read(targetPath, targetName);
                if (!isCancelled) {
                    setContent(noteContent);
                    loadedElectronRef.current ={
                        path: targetPath,
                        electronName: targetName,
                        content: noteContent
                    };
                }
            } catch (error) {
                console.error("Błąd załadowania elektronu: ", error);
            }finally{
                if (!isCancelled) setIsLoading(false);
            }
        }

        loadNewElectron();

        return ()=>{
            isCancelled = true;
            const {path:savePath, electronName: saveName, content: savePayload}= loadedElectronRef.current;
            if(savePath && saveName){
                window.api.electron.save(savePath, saveName, savePayload);
            }
        }
    },[electronId]);
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
                        {content.replace(/\n/g, '<br/>')}
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
                            loadedElectronRef.current.content = value;
                        }
                    }
                        
                    theme='light'
                />
            )}
        </div>
    );
};
