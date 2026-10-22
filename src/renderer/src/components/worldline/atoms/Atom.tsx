
import { useUIActions } from "@renderer/store/uiStore";
import { useWorldlineActions } from "@renderer/store/worldlineStore";
import type { AtomView } from "@shared/domain/types";
import { memo, useCallback, type MouseEvent } from "react";


export const Atom = memo(({ atom }: { atom: AtomView }) => {
    const {openContextMenu} = useUIActions();
    const { selectAtom } = useWorldlineActions();

    const handleContextMenu = useCallback((e:MouseEvent) => {
        e.preventDefault();
        openContextMenu({
            x: e.clientX,
            y: e.clientY,
            target: {
                type: 'atom' as const,
                atomId: atom.meta.id
            }
        })
    }, [atom.meta.id, openContextMenu]);


    return (
        <div className="cursor-pointer bg-amber-300 text-balance">
            <span onClick={()=>selectAtom(atom.meta.id)} onContextMenu={handleContextMenu}>
                {atom.name}
            </span>
    
        </div>
    );
});
