import { useUIActions, useUIStore } from "@renderer/store/uiStore"
import { useWorldlineActions } from "@renderer/store/worldlineStore"
import type { AtomId } from "@shared/schemas/ids"
import { validateFileName } from "@shared/utils/fileName"
import { useEffect, useRef, useState, type HTMLAttributes } from "react"

//const BaseInput =(props: HTMLAttributes<HTMLInputElement>)=>{

//    <input
//        placeholder="Nazwa Elektronu"
//        {...props}
//    />
//}
export const CreateElectron=({atomId}:{atomId:AtomId})=>{
    const {createElectron} = useWorldlineActions();
    const {setCreatingElectron} = useUIActions();
    const isCreatingElectron = useUIStore(state=>state.editingElectron?.atomId === atomId);
    const [electronName, setElectronName] = useState("");
    const [electronError, setElectronError] = useState<string|null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const validationStatus = validateFileName(electronName);
    useEffect(()=>{
        if(!inputRef.current) return;
        inputRef.current.focus();
        inputRef.current.select();
    },[isCreatingElectron])

    const handleKeyDown =async(e:React.KeyboardEvent)=>{
        if(e.key === "Enter"){
            if(!validationStatus.valid){
                inputRef.current?.focus(); 
                console.log('dupa');
                
                return;
            }
            const createResult = await createElectron(atomId, electronName);
            if(createResult.status==='error'){
                setElectronError(createResult.message)
                return;
            }
            setCreatingElectron(null);
        }else if(e.key === "Escape"){
            setElectronName("");
            setCreatingElectron(null);
        }
    }
    return(
        <>
            {electronError}
            {!validationStatus.valid?validationStatus.reason:""}
            <input 
                placeholder="Nazwa Elektronu"
                value={electronName}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onBlur={()=>setCreatingElectron(null)}
                onChange={(e)=>setElectronName(e.target.value)}
            />
        </>
    )
}
