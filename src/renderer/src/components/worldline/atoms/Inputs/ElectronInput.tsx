import { useUIActions } from "@renderer/store/uiStore"
import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore"
import type { Status } from "@shared/domain/types"
import type { AtomId, ElectronId } from "@shared/schemas/ids"
import { validateFileName } from "@shared/utils/fileName"
import { useEffect, useRef, useState, type ComponentPropsWithRef} from "react"

const BaseInput = (props: ComponentPropsWithRef<"input">)=>{
    return(
    <input
        placeholder="Nazwa elektronu"
        {...props}
    />
)
}

type ElectronNameInputProps ={
    initialValue?: string;
    onSubmit: (name: string)=>Promise<Status>;
    onClose: ()=>void;
}
const ElectronNameInput = ({initialValue="", onSubmit, onClose}: ElectronNameInputProps)=>{
    const [electronName, setElectronName] = useState(initialValue);
    const [electronError, setElectronError] = useState<string|null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const validationStatus = validateFileName(electronName);

    useEffect(()=>{
        inputRef.current?.focus();
        inputRef.current?.select();
    },[]);

    const handleKeyDown = async(e:React.KeyboardEvent<HTMLInputElement>)=>{
        if(e.key==="Escape"){
            onClose();
            return;
        }
        if(e.key !== "Enter") return;
        if(!validationStatus.valid){
            inputRef.current?.focus();
            return;
        }
        const result = await onSubmit(electronName);
        if(result.status==="error"){
            setElectronError(result.message);
            return;
        }
        onClose();
    }
    return(
        <>
            {electronError}
            {!validationStatus.valid? validationStatus.reason: ""}
            <BaseInput
                ref={inputRef}
                value={electronName}
                onKeyDown={handleKeyDown}
                onBlur={onClose}
                onChange={(e)=>{
                    setElectronName(e.target.value);
                    setElectronError(null);
                }}
            />
        </>
    )
}

export const CreateElectron = ({atomId}:{atomId:AtomId})=>{
    const {createElectron} = useWorldlineActions();
    const {setCreatingElectron} = useUIActions();
    
    return(
        <ElectronNameInput
            onSubmit={(name)=>createElectron(atomId, name)}
            onClose={()=>setCreatingElectron(null)}
        />
    )
}

export const RenameElectron = ({atomId, electronId}:{atomId:AtomId, electronId: ElectronId})=>{
    const {renameElectron} = useWorldlineActions();
    const {setEditingElectronRef} = useUIActions();
    const electron = useWorldlineStore(
        state =>state.worldlineData
                ?.worldline
                .atoms[atomId]
                ?.electrons[electronId]
    );

if (!electron) return null;
    return(
        <ElectronNameInput
            initialValue={electron.filename.replace(/\.[^/.]+$/, "")}
            onSubmit={(name)=>renameElectron(atomId, electronId, name)}
            onClose={()=>setEditingElectronRef(null)}
        />
    )
}