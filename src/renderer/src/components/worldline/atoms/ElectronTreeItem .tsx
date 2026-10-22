import { useWorldlineActions } from "@renderer/store/worldlineStore";
import type { ElectronView } from "@shared/domain/types";
import { memo, useCallback } from "react";

export const ElectronTreeItem  = memo(({ electron }: { electron: ElectronView }) => {
    const { selectElectron } = useWorldlineActions();
    const handleSelect = useCallback(() => {
        selectElectron(electron.ownerAtomId, electron.id);
    }, [electron.ownerAtomId, electron.id, selectElectron]);

    return (
        <li>
            <button type="button" onClick={handleSelect} className="cursor-pointer truncate flex-1">
                {electron.filename.replace(/\.[^/.]+$/, "")}
            </button>
        </li>
    );
});