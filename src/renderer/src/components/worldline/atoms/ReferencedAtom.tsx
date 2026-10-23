import { useWorldlineStore } from "@renderer/store/worldlineStore";
import type { AtomId } from "@shared/schemas/ids";
import { ElectronTreeItem } from "./ElectronTreeItem ";

export const ReferencedAtom = ({ atomId }: { atomId: AtomId }) => {
    const referencedAtom = useWorldlineStore(
        state => state.worldlineData?.worldline.atoms?.[atomId]
    );
    if (!referencedAtom) return null;

    const referencedElectrons = referencedAtom.electrons ?? {};
    return (
        <li>
            <ul>
                {Object.values(referencedElectrons).map((electron) => (
                        <ElectronTreeItem electron={electron} borrowedFrom={referencedAtom.name}/>
                ))}
            </ul>
        </li>
    );
};