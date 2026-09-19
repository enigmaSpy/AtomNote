import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore"
import { getCurrentFileName } from "@renderer/utils/currentFileName";
import type { Atom, ElectronNote } from "@shared/domain/types"
import { memo, useCallback } from "react"
import { Fragment } from "react/jsx-runtime"
interface AtomsTreeProps{
    atoms: Atom[];
}
/**
 * Zwraca drzewo aotomów 
 * 
 * @param atoms  atomy z bierzącego wordline
 * @returns 
 */
export const AtomsTree = ({atoms}:AtomsTreeProps) => {
    const activeAtomId = useWorldlineStore((state)=>state.activeAtomId);

    return (
        <ul>
            {atoms.map((atom)=>(
                <Fragment key={atom.id}>
                    <AtomTreeItem atom={atom}/>

                    {atom.id === activeAtomId&&(
                        <ul
                            className="p-4"
                        >
                            {atom.electrons?.map((electron)=>(
                                <ElectronTreeItem key={electron.id} electron={electron}/>
                            ))}
                        </ul>
                    )}
                </Fragment>
            ))}
        </ul>
    )
}

const AtomTreeItem = memo(({atom}:{atom:Atom})=>{
    const { selectAtom } = useWorldlineActions();
    const handleSelect = useCallback(
        ()=>selectAtom(atom.id),[atom.id, selectAtom]
        
    )
    return (
        <li className="cursor-pointer bg-amber-300 text-balance" 
            onClick={handleSelect}
        >
            {atom.name} ({atom.mastery}%)
        </li>
    )
});

const ElectronTreeItem = memo(({electron}:{electron:ElectronNote})=>{
    const { selectElectron, setPath } = useWorldlineActions();
    const activeAtomName = getCurrentFileName().atomName;
    const rootPath = useWorldlineStore(state => state.worldlineData)?.worldline.rootPath;
    if(!rootPath || !activeAtomName) return//TODO: dodać obsługę ostrzeżeń
    
    const handleSelect = useCallback(()=>{
        selectElectron(electron.id);
        setPath(rootPath, activeAtomName);        
    },[electron.id, selectElectron])
    return(
        <li
            key={electron.id}
            onClick={handleSelect}
            className="cursor-pointer truncate flex-1"
        >
            {electron.filename} ({electron.mastery}%)
        </li>
    )
});