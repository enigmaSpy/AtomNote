import { useUIActions } from "@renderer/store/uiStore";
import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore";
import type { AtomView, ElectronView } from "@shared/domain/types";
import type { AtomId } from "@shared/schemas/ids";
import { memo, useCallback, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import styles from './Worldline.module.css';

/**
 * Zwraca drzewo aotomów 
 * 
 * @param atoms  atomy z bierzącego wordline
 * @returns 
 */
export const AtomsTree = () => {
    const worldline = useWorldlineStore((state)=> state.worldlineData);
    const activeAtomId = useWorldlineStore((state)=>state.activeAtomId);
    const {setIsCreateAtomOpen} = useUIActions();

    const atoms = Object.values(worldline?.worldline.atoms??{})
    console.log({
    worldline,
    activeAtomId,
});
    return (
        <div>
            <button 
                        className={styles.newElectronBtn}
                        onClick={()=>setIsCreateAtomOpen(true)}
                    >
                        + Dodaj Atom
            </button>
            <ul>
                {atoms.map((atom)=>(
                    <Fragment key={atom.meta.id}>
                        <AtomWrapper atom={atom}/>
                    </Fragment>
                ))}
            </ul>
        </div>
    )
}
const AtomWrapper = ({ atom }: { atom: AtomView }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <li onClick={()=>setIsOpen(prev=>!prev)}>
                <Atom atom={atom}/>
            </li>
            {isOpen&&(<ul className="p-4">
                {Object.values(atom.electrons ?? {}).length === 0 ? (
                    <li className={styles.emptyElectron}>Brak elektronów</li>
                ) : (
                    Object.values(atom.electrons ?? {}).map(electron => (
                        <Electrons key={electron.id} electron={electron} />
                    ))
                )}
                {atom.references?.referencedAtoms.map((atomId) => (
                    <ReferencedAtom
                        atomId={atomId}
                        key={atomId}
                    />
                ))}
            </ul>)}
        </>
    )
}
const Atom = memo(({atom}:{atom:AtomView})=>{
    const { selectAtom, deleteAtom } = useWorldlineActions();
    const handleSelect = useCallback(
        ()=>selectAtom(atom.meta.id),[atom.meta.id, selectAtom]
    )
    const handleDelete = useCallback(() => {
        deleteAtom(atom.name, atom.meta.id);
    }, [atom.name, atom.meta.id, deleteAtom]);
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
            <button onClick={handleDelete}>Usuń</button>
        </li>
    )
});

const Electrons = memo(({ electron }: { electron: ElectronView }) => {
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

const ReferencedAtom = ({ atomId }: { atomId: AtomId }) => {
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

