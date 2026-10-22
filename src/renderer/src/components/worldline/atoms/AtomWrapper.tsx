import { useState } from "react";
import { Atom } from "./Atom";
import type { AtomView } from "@shared/domain/types";

import styles from '../Worldline.module.css';
import { ElectronTreeItem  } from "./ElectronTreeItem ";
import { ReferencedAtom } from "./ReferencedAtom";

export const AtomWrapper = ({ atom }: { atom: AtomView }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const electrons = Object.values(atom.electrons);
    const referencedAtoms = atom.references.referencedAtoms ?? [];
    return (
        <li>
            <div 
                onClick={()=>setIsOpen(prev=>!prev)}
                aria-expanded={isOpen}
                aria-label={
                    isOpen? "Zwiń Atom": "Rozwiń Atom"
                }
            >
                <Atom atom={atom}/>
            </div>
            {isOpen&&(<ul className="p-4">
                {electrons.map(electron=>(
                    <ElectronTreeItem   
                        key={electron.id}
                        electron={electron}
                    />
                ))}
                {referencedAtoms.map(atomId=>(
                    <ReferencedAtom
                        key={atomId}
                        atomId={atomId}
                    />
                ))}
                {electrons.length === 0 &&
                    referencedAtoms.length === 0 && (
                        <li className={styles.emptyElectron}>
                            Brak zawartości
                        </li>
                    )
                }
            </ul>
        )}
        </li>
    )
}