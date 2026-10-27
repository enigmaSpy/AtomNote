import { useUIActions } from "@renderer/store/uiStore"

export const ElectronContextMenu = ({atomId, electronId}) => {
  const {setEditingElectronRef}=useUIActions();
  return (
    <>
      {atomId}-{electronId}
      <button type="button" role="menuitem" onClick={()=>setEditingElectronRef({atomId, electronId})}> 
          Zmień nazwę
      </button>
      <button type="button" role="menuitem">
        Usuń Atom
      </button>
    </>
  )
}
