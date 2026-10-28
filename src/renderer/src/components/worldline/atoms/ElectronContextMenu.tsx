import { useUIActions } from "@renderer/store/uiStore"

export const ElectronContextMenu = ({atomId, electronId}) => {
  const {setEditingElectronRef,closeContextMenu}=useUIActions();
  const handleRename=()=>{
    closeContextMenu();
    setEditingElectronRef({atomId, electronId});
  }
  return (
    <>
      {atomId}-{electronId}
      <button type="button" role="menuitem" onClick={handleRename}> 
          Zmień nazwę
      </button>
      <button type="button" role="menuitem">
        Usuń Elektrob
      </button>
    </>
  )
}
