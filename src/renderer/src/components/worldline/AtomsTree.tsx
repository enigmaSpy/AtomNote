import { useUIActions } from "@renderer/store/uiStore";
import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore";
import type { AtomView, ElectronView } from "@shared/domain/types";
import type { AtomId } from "@shared/schemas/ids";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import styles from './Worldline.module.css';
import { AtomWrapper } from "./atoms/AtomWrapper";

/**
 * Zwraca drzewo aotomów 
 * 
 * @param atoms  atomy z bierzącego wordline
 * @returns 
 */
export const AtomsTree = () => {
    const worldline = useWorldlineStore((state)=> state.worldlineData);
    const {setIsCreateAtomOpen} = useUIActions();

    const atoms = Object.values(worldline?.worldline.atoms??{})
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

