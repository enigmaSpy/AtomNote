import { useUIActions, useUIStore } from "@renderer/store/uiStore";
import type { AtomView } from "@shared/domain/types";
import { memo, useCallback, type MouseEvent } from "react";
import style from './Atoms.module.css'
import { AtomBtnWrapper } from "./AtomBtnWrapper";
import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore";
import { AtomRenameInput } from "./Inputs/AtomRenameInput";
import { CreateElectron } from "./Inputs/ElectronInput";

export const Atom = memo(({ atom }: { atom: AtomView }) => {
    const {openContextMenu} = useUIActions();
    const { setAtomPointer } = useWorldlineActions();
    const isEditing = useUIStore(state=>state.editingAtomId === atom.meta.id);
    const isCreatingElectron = useUIStore(state=>state.creatingElectron === atom.meta.id);
    const atomPointer = useWorldlineStore(state=>state.atomPointer);

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
    const handleOnClick =()=>{
        if(atomPointer.electronId===null){
            setAtomPointer({atomId: atom.meta.id,electronId: null})
        }
    }
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
                            onClick={handleOnClick} 
                            
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
