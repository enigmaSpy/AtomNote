import { useUIActions, useUIStore } from "@renderer/store/uiStore";
import type { AtomView } from "@shared/domain/types";
import { memo, useCallback, type MouseEvent } from "react";
import style from './Atoms.module.css'
import { AtomBtnWrapper } from "./AtomBtnWrapper";
import { useWorldlineActions } from "@renderer/store/worldlineStore";
import { AtomRenameInput } from "./Inputs/AtomRenameInput";
import { CreateElectron } from "./Inputs/ElectronInput";

export const Atom = memo(({ atom }: { atom: AtomView }) => {
    const {openContextMenu} = useUIActions();
    const { selectAtom } = useWorldlineActions();
    const isEditing = useUIStore(state=>state.editingAtomId === atom.meta.id);
    const isCreatingElectron = useUIStore(state=>state.creatingElectron === atom.meta.id);

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
            {isEditing?(
                <AtomRenameInput atom={atom}/>
            ):(
                <>
                    <div className={style.atomItem} onContextMenu={handleContextMenu}>
                        <button 
                            className={style.atomBtn}
                            type="button" 
                            onClick={()=>selectAtom(atom.meta.id)} 
                            
                        >
                            {atom.name} 
                        </button>
                        <AtomBtnWrapper atomId={atom.meta.id}/>
                    </div>
                    {isCreatingElectron&&(
                        <CreateElectron atomId={atom.meta.id}/>
                    )}
                </>
            )}
        </div>
    );
});
