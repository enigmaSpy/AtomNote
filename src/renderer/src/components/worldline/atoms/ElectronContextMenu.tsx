import { useUIActions } from "@renderer/store/uiStore"
import { useWorldlineActions } from "@renderer/store/worldlineStore";

export const ElectronContextMenu = ({atomId, electronId}) => {
  const {setEditingElectronRef,closeContextMenu}=useUIActions();
  const {deleteElectron} = useWorldlineActions();
  const handleRename=()=>{
    closeContextMenu();
    setEditingElectronRef({atomId, electronId});
  }
  const handleDelete=()=>{
    closeContextMenu();
    deleteElectron(atomId, electronId);
  }
  return (
    <>
      {atomId}-{electronId}
      <button type="button" role="menuitem" onClick={handleRename}> 
          Zmień nazwę
      </button>
      <button type="button" role="menuitem" onClick={handleDelete}>
        Usuń Elektrob
      </button>
    </>
  )
}
