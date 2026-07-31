import { useWorldlineStore } from "@renderer/store/worldlineStore"
import type { Atom } from "@shared/domain/types"
import { Fragment } from "react/jsx-runtime"

interface AtomsTreeProps{
    atoms: Atom[];
}

export const AtomsTree = ({atoms}:AtomsTreeProps) => {
    const {actions, activeAtomId} = useWorldlineStore();
    return (
        <ul>
            {atoms.map((atom)=>(
                <Fragment key={atom.id}>
                    <li
                        style={{cursor:'pointer', 
                                fontWeight: atom.id=== activeAtomId?'bold':'normal'
                            }}//TODO: Do przepisania w css
                            onClick={()=>actions.selectAtom(atom.id)}
                    >
                        {atom.name} ({atom.mastery}%)
                    </li>
                    {atom.id === activeAtomId&&(
                        <ul
                            style={{padding: '1rem'}}
                        >
                            {atom.electrons.map((electron)=>(
                                <li
                                    key={electron.id}
                                    onClick={()=>actions.selectElectron(electron.id)}
                                    style={{cursor:'pointer'}}
                                >
                                    {electron.filename} ({electron.mastery}%)
                                </li>
                            ))}
                        </ul>
                    )}
                </Fragment>
            ))}
        </ul>
    )
}
