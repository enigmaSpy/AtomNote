
export const ElectronContextMenu = ({atomId, electronId}) => {
  return (
    <>
      {atomId}-{electronId}
      <button type="button" role="menuitem"> 
          Zmień nazwę
      </button>
      <button type="button" role="menuitem">
        Usuń Atom
      </button>
    </>
  )
}
