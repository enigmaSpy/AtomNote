import { AddAtomBondSVG, AddCovalentAtomSVG, AddElectronSVG } from "@renderer/assets/svgComponents";
import style from './Atoms.module.css'
import { useUIActions } from "@renderer/store/uiStore";
import type { AtomId } from "@shared/schemas/ids";

export const AtomBtnWrapper = ({atomId}: {atomId:AtomId}) => {
    const {setCreatingElectron} = useUIActions();
    return (
        <div className={style.operationWrapper}>
            <button type="button" className="icon-btn" aria-label="Dodaj elektron" onClick={()=>setCreatingElectron(atomId)}>
                <AddElectronSVG/>
            </button>
            <button type="button" className="icon-btn" aria-label="Dodaj elektron kowalencyjny">
                <AddCovalentAtomSVG/>
            </button>
            <button type="button" className="icon-btn" aria-label="Dodaj splątanie atomowe">
                <AddAtomBondSVG/>
            </button>
        </div>
    )
}
