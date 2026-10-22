import { useWorldlineStore } from "@renderer/store/worldlineStore"
import type { AtomId } from "@shared/schemas/ids"

interface Props{
    atomId: AtomId
}

export const AtomContextMenu = ({atomId}:Props) => {
    const atom = useWorldlineStore(state => state.worldlineData?.worldline.atoms[atomId]);

    return (
        <>
            {atom?.name}
            <button type="button" role="menuitem"> 
                Zmień nazwę
            </button>
            <button>
                Usuń Atom
            </button>
        </>
    )
}
