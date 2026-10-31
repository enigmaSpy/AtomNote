import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore"
import styles from './Worldline.module.css'
import { useRef, useState } from "react";
import type { AtomMeta } from "@shared/schemas/atom";
import { validateFileName } from "@shared/utils/fileName";
export const CreateAtomModal = () => {
    const domains = useWorldlineStore(state=> state.worldlineData)?.worldline.domains;
    const {createAtom} = useWorldlineActions();

    const [atomName, setAtomName] = useState("");
    const [atomDomain, setAtomDomain] = useState<string>("");
    const [atomDescription, setAtomDescription] = useState("");
    const [createError, setCreateError] = useState<string|null>(null);
    const atomNameRef = useRef<HTMLInputElement>(null);
    const atomDomainRef = useRef<HTMLInputElement>(null);

    const validationStatus = validateFileName(atomName);
    const handleCreate=(async(e)=>{
        e.preventDefault();
        if(!atomDomainRef.current) return;
        if(!atomName.trim()){
            atomNameRef.current?.focus();
            return;
        }
        if(!validationStatus.valid){
            atomDomainRef.current?.focus();
            return;
        }
        const atomContent:Omit<AtomMeta, 'id'|'domainId'|'createdAt'|'updatedAt'> = {
            description: atomDescription,
        }
        const createResult = await createAtom(atomContent, atomName.trim(), atomDomain);
        if (createResult.status === 'error') {
            setCreateError(createResult.message);            
        }else{
            setCreateError(null);
            setAtomName('');
            setAtomDescription('');
            setAtomDomain("");
        }
        
    });
    
    return (
        <form className={styles.createAtomForm} onSubmit={handleCreate}>
            <div className="errorInfo">{createError&&(<span >Błąd zapisu: {createError}</span>)}</div>
            {!validationStatus.valid && atomName.length>0?validationStatus.reason:""}
            <input type="text" placeholder="Nazwa" className="input" value={atomName} onChange={(e)=>setAtomName(e.target.value)} ref={atomNameRef}/>
            <input placeholder="Domena" list="domains" className="input" value={atomDomain} onChange={(e)=>setAtomDomain(e.target.value)} ref={atomDomainRef}/>

            <datalist id="domains">
                {
                    domains && Object.entries(domains).map(([id, domain])=>(
                        <option key={id} value={domain.name}/>
                    ))
                }
            </datalist>
            
            <textarea placeholder="Opis" className='textarea'  value={atomDescription} onChange={(e)=>setAtomDescription(e.target.value)}/>
            <button type="submit">Zapisz</button>
        </form>
    )
}
