import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore";
import type { ElectronView } from "@shared/domain/types";
import type { AtomId } from "@shared/schemas/ids";
import { useCallback } from "react";

export const ReferencedAtom = ({ atomId }: { atomId: AtomId }) => {
    const { selectElectron } = useWorldlineActions();
    const referencedAtom = useWorldlineStore(
        state => state.worldlineData?.worldline.atoms?.[atomId]
    );
    if (!referencedAtom) return null;
    
    const handleSelect = useCallback((electron: ElectronView) => {
        selectElectron(electron.ownerAtomId, electron.id);
    }, [selectElectron]);

    const referencedElectrons = referencedAtom.electrons ?? {};

    return (
        <li>
            <ul>
                {Object.values(referencedElectrons).map((electron) => (
                    <li
                        key={electron.id}
                        onClick={() => handleSelect(electron)}
                        className="cursor-pointer truncate flex-1"
                    >
                        {electron.filename.replace(/\.[^/.]+$/, "")}/{referencedAtom?.name}
                    </li>
                ))}
            </ul>
        </li>
    );
};