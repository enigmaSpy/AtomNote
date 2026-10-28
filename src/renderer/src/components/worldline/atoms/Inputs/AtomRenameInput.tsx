import { useWorldlineActions } from "@renderer/store/worldlineStore";
import { useEffect, useRef, useState } from "react";
import { validateFileName } from "@shared/utils/fileName";
import { useUIActions } from "@renderer/store/uiStore";


export const AtomRenameInput = ({atom}) => {
    const { renameAtom } = useWorldlineActions();
    const [atomError, setAtomError] = useState<string|null>(null);
    const [newAtomName, setNewAtomName] = useState(atom.name);
    const {setEditingAtomId} = useUIActions();
    const validationStatus = validateFileName(newAtomName);
    const renameInputRef = useRef<HTMLInputElement>(null);
    
    const handleKeyDown =async(e:React.KeyboardEvent)=>{
        if(e.key === "Enter"){
            if(!validationStatus.valid){
                renameInputRef.current?.focus(); 
                return;
            }
            const renameResult = await renameAtom(atom.meta.id, newAtomName);
            if(renameResult.status==='error'){
                setAtomError(renameResult.message)
                return;
            }
            setEditingAtomId(null);
        }else if(e.key === "Escape"){
            setNewAtomName(atom.name);
            setEditingAtomId(null);
        }
    }
    useEffect(()=>{
        if (!renameInputRef.current) return;
        renameInputRef.current.focus();
        renameInputRef.current.select();
    }, []);
    return (
    <>
        {atomError}
        {!validationStatus.valid?validationStatus.reason:""}
        <input 
            value={newAtomName} 
            onChange={(e)=>setNewAtomName(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={renameInputRef}
            placeholder="Nazwa atomu" 
            onBlur={()=>setEditingAtomId(null)}
        />        
    </>
  )
}
