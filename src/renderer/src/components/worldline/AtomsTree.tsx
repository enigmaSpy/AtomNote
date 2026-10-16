import { useWorldlineActions, useWorldlineState, useWorldlineStore } from "@renderer/store/worldlineStore";
import { memo, useCallback } from "react";
import { Fragment } from "react/jsx-runtime";
import styles from './Worldline.module.css';
import type { AtomView, ElectronView } from "@shared/domain/types";
import type { AtomId } from "@shared/schemas/ids";

/**
 * Zwraca drzewo aotomów 
 * 
 * @param atoms  atomy z bierzącego wordline
 * @returns 
 */
export const AtomsTree = () => {
    const worldline = useWorldlineStore((state)=> state.worldlineData);
    const activeAtomId = useWorldlineStore((state)=>state.activeAtomId);
    const setIsCreateAtomOpen = useWorldlineState(state => state.setCreateAtomOpen);

    const atoms = Object.values(worldline?.worldline.atoms??{})
    console.log({
    worldline,
    activeAtomId,
});
    return (
        <ul>
            {atoms.map((atom)=>(
                <Fragment key={atom.meta.id}>
                    <AtomTreeItem atom={atom}/>

                    {atom.meta.id === activeAtomId&&(
                        <ul className="p-4">
                            {Object.values(atom.electrons ?? {}).map((electron)=>(
                                <ElectronTreeItem 
                                    key={electron.id}  
                                    electron={electron}
                                    />
                            ))}
                            {Object.values(atom.references?.referencedAtoms ?? []).map((atomId) => (
                                <ReferencenAtomTreeItem
                                    atomId={atomId}
                                    key={atomId}
                                />
                            ))}
                        </ul>
                    )}
                </Fragment>
            ))}
            <li>
                <button 
                    className={styles.newElectronBtn}
                    onClick={()=>setIsCreateAtomOpen(true)}
                >
                    + Dodaj Atom
                </button>
            </li>
        </ul>
    )
}

const AtomTreeItem = memo(({atom}:{atom:AtomView})=>{

    const { selectAtom } = useWorldlineActions();
    const handleSelect = useCallback(
        ()=>selectAtom(atom.meta.id),[atom.meta.id, selectAtom]
        
    )
    return (
        <li className="cursor-pointer bg-amber-300 text-balance">
            <span onClick={handleSelect} className="">
                {atom.name}
            </span>
            <button 
                className={styles.newElectronBtn}
            >
                +
            </button>
        </li>
    )
});

const ElectronTreeItem = memo(({ electron }: { electron: ElectronView }) => {
    const { selectElectron } = useWorldlineActions();
    const handleSelect = useCallback(() => {
        selectElectron(electron.ownerAtomId, electron.id);
    }, [electron.ownerAtomId, electron.id, selectElectron]);

    return (
        <li onClick={handleSelect} className="cursor-pointer truncate flex-1">
            {electron.filename.replace(/\.[^/.]+$/, "")}
        </li>
    );
});

const ReferencenAtomTreeItem = ({ atomId }: { atomId: AtomId }) => {
    const { selectElectron } = useWorldlineActions();
    const referencedAtoms = useWorldlineStore(state => state.worldlineData)?.worldline.atoms ?? {};
    
    const handleSelect = useCallback((electron: ElectronView) => {
        selectElectron(electron.ownerAtomId, electron.id);
    }, [selectElectron]);

    if (!referencedAtoms[atomId]) return null;

    const referencedElectrons = referencedAtoms[atomId].electrons ?? {};

    return (
        <li>
            <ul>
                {Object.values(referencedElectrons).map((electron) => (
                    <li
                        key={electron.id}
                        onClick={() => handleSelect(electron)}
                        className="cursor-pointer truncate flex-1"
                    >
                        {electron.filename.replace(/\.[^/.]+$/, "")}/{referencedAtoms[atomId]?.name}
                    </li>
                ))}
            </ul>
        </li>
    );
};

