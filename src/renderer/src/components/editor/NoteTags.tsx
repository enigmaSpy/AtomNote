import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore";
import { useState } from "react";

export const NoteTags = () => {
    const activeAtomId = useWorldlineStore(state=>state.atomPointer.atomId);
    const activeElectronId = useWorldlineStore(state=>state.atomPointer.electronId);
    const atoms = useWorldlineStore(state=>state.worldlineData?.worldline.atoms);
    const {addTags, deleteTags} = useWorldlineActions();
    const [tagErrorCode, setTagErrorCode] = useState<string|null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newTag, setNewTag] = useState<string>('');

    if(!activeAtomId || !activeElectronId|| !atoms) return null;
    const electronTags = atoms[activeAtomId]?.electrons[activeElectronId]?.tags ?? [];
    const addTagHandle =async()=>{
        const tags = newTag.split(',').map((t) => t.trim()).filter(Boolean);
        if (tags.length === 0) return;

        setTagErrorCode(null);
        const addResult = await addTags(activeAtomId, activeElectronId, tags);
        setIsSaving(false);
        if(addResult.status === 'error'){
            setTagErrorCode(addResult.code);
            return;
        }
        
        setNewTag('');
    }
    const deleteTagHandle =async(tagName: string)=>{
        setIsSaving(true);
        const tags = [tagName];

        setTagErrorCode(null);
        const deleteResult =await deleteTags(activeAtomId, activeElectronId, tags);
        setIsSaving(false);
        if(deleteResult.status === 'error'){
            setTagErrorCode(deleteResult.code);
            return;
        }
        
    }
    return (
        <div>
            {tagErrorCode}
            {electronTags.length > 0 ? (
                electronTags.map((tagName)=>(
                    <div key={tagName}>
                        {!isSaving&&<span onClick={()=>deleteTagHandle(tagName)}>ˣ</span>}
                        {tagName}
                    </div>
                ))
            ):(
                <div>Brak tagów do wyświetlenia</div>
            )}
            <>
                <input 
                    disabled={isSaving}
                    placeholder="tag" 
                    value={newTag}
                    onChange={(e)=>setNewTag(e.target.value)}/>
                <button 
                    onClick={addTagHandle}
                    disabled={isSaving}
                    onKeyDown={(e) => e.key === 'Enter' && addTagHandle()}
                >+dodaj tag</button>
            </>
        </div>
    )
}
