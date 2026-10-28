import { useUIActions } from "@renderer/store/uiStore";
import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore"
import type { AtomId } from "@shared/schemas/ids"

interface Props{
    atomId: AtomId
}

export const AtomContextMenu = ({atomId}:Props) => {
    const atom = useWorldlineStore(state => state.worldlineData?.worldline.atoms[atomId]);

    const {deleteAtom} = useWorldlineActions()
    const {setEditingAtomId, closeContextMenu} = useUIActions()
    if (!atom) return null

    const handleRename =()=>{
        closeContextMenu();
        setEditingAtomId(atom.meta.id)        
    }
    const handleDelete =()=>{
        closeContextMenu();
        deleteAtom(atomId);
    }
    return (
        <>
            {atom.name}
            <button type="button" role="menuitem" onClick={handleRename}> 
                Zmień nazwę
            </button>
            <button type="button" role="menuitem" onClick={handleDelete}>
                Usuń Atom
            </button>
        </>
    )
}
