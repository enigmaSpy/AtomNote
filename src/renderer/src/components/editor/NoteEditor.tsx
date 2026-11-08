import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { useEffect, useRef, useState } from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useDebounce } from "@renderer/hooks/useDebounce";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styles from "./NoteEditor.module.css";
import { useActiveAtomName } from "@renderer/hooks/useActiveAtomName";
import { useActiveElectronName } from "@renderer/hooks/useActiveElectronName";

/**
 *  Widk notatki, pozwala edytować oraz wyświetlać notatkę
 * 
 * @returns zwraca widok notatki
 */
export const NoteEditor = () => {
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [content, setContent] = useState<string>("");

    const rootPath = useWorldlineStore(state=> state.worldlineData?.worldline.rootPath);
    const atomName = useActiveAtomName();
    const electronName  = useActiveElectronName();
    const electronId = useWorldlineStore(state =>state.atomPointer.electronId);
    
    const debounceContent = useDebounce(content, 500);

    const loadedElectronRef = useRef({
        rootPath: '',
        atomName: '',
        fileName: '',
        content: ''
    });


    useEffect(()=>{
        const {rootPath: rootSegment, atomName: atomSegment,fileName: saveName, content: savePayload} = loadedElectronRef.current;
        if (rootSegment&&atomSegment && saveName && savePayload !== undefined) {
            window.api.electron.save(rootSegment, atomSegment, saveName, savePayload).catch(console.error);
        }
    },[debounceContent]);
    useEffect(() => {
        if (rootPath && atomName && electronName && loadedElectronRef.current.fileName) {
            loadedElectronRef.current.rootPath = rootPath;
            loadedElectronRef.current.atomName = atomName;
            loadedElectronRef.current.fileName = `${electronName}.md`;
        }
    }, [rootPath, atomName, electronName]);
    
    useEffect(()=>{
        if (!electronName)return;        
        
        let isCancelled = false;
        const loadNewElectron=async()=>{
            setIsLoading(true);
            try {
                const targetName = electronName;
                if (rootPath&&atomName) {
                    
                    const noteContent = await window.api.electron.read(rootPath, atomName, `${targetName}.md`);
                    if (!isCancelled) {
                        setContent(noteContent);
                        loadedElectronRef.current ={
                            rootPath: rootPath,
                            atomName: atomName,
                            fileName: `${targetName}.md`,
                            content: noteContent
                        };
                    }
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
            const {rootPath: rootSegment, atomName: atomSegment,fileName: saveName, content: savePayload}= loadedElectronRef.current;
            if(saveName && rootSegment && atomSegment){
                window.api.electron.save(rootSegment, atomSegment, saveName, savePayload);
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
