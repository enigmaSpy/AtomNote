import { useUIActions } from "@renderer/store/uiStore";
import { useWorldlineActions } from "@renderer/store/worldlineStore";
import type { ElectronView } from "@shared/domain/types";
import { memo, useCallback } from "react";

export const ElectronTreeItem  = memo(({ electron, borrowedFrom }: { electron: ElectronView, borrowedFrom?:string }) => {
    const { selectElectron } = useWorldlineActions();
    const {openContextMenu} = useUIActions();
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
            <button type="button" onClick={handleSelect} onContextMenu={handleContextMenu} className="cursor-pointer truncate flex-1">
                {electron.filename.replace(/\.[^/.]+$/, "")}/{borrowedFrom?borrowedFrom:""}
            </button>
        </li>
    );
});