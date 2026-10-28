import { useUIActions, useUIStore } from "@renderer/store/uiStore";
import { useWorldlineActions } from "@renderer/store/worldlineStore";
import type { ElectronView } from "@shared/domain/types";
import { memo, useCallback } from "react";
import { RenameElectron } from "./Inputs/ElectronInput";

export const ElectronTreeItem  = memo(({ electron, borrowedFrom }: { electron: ElectronView, borrowedFrom?:string }) => {
    const { selectElectron } = useWorldlineActions();
    const {openContextMenu} = useUIActions();
    const editingElectron = useUIStore(s=>s.editingElectron);

    
    const handleSelect = useCallback(() => {
        selectElectron(electron.ownerAtomId, electron.id);
    }, [electron.ownerAtomId, electron.id, selectElectron]);
    const handleContextMenu = useCallback((e:React.MouseEvent) => {
            e.preventDefault();
            openContextMenu({
                x: e.clientX,
                y: e.clientY,
                target: {
                    type: 'electron' as const,
                    atomId: electron.ownerAtomId,
                    electronId: electron.id
                }
            })
        }, [electron.id, openContextMenu]);
    return (
        <li>
            {editingElectron?.atomId === electron.ownerAtomId && editingElectron.electronId === electron.id?(
                    <RenameElectron atomId={electron.ownerAtomId} electronId={electron.id}/>
                ):(
            <button 
                type="button" 
                onClick={handleSelect}
                onContextMenu={handleContextMenu} 
                className="truncate flex-1 w-full text-left"
                aria-label="Otwórz elektron"
            >
                {electron.filename.replace(/\.[^/.]+$/, "")}{borrowedFrom?`/${borrowedFrom}`:""} 
            </button>
        )}
        </li>
    );
});