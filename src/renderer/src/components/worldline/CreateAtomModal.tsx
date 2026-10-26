import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore"
import styles from './Worldline.module.css'
import { useRef, useState } from "react";
import type { AtomMeta } from "@shared/schemas/atom";
import type { DomainId } from "@shared/schemas/ids";
export const CreateAtomModal = () => {
    const domains = useWorldlineStore(state=> state.worldlineData)?.worldline.domains;
    const worldlineData = useWorldlineStore(state => state.worldlineData)?.worldline;
    const {createAtom} = useWorldlineActions();

    const rootPath = worldlineData?.rootPath;
    const [atomName, setAtomName] = useState("");
    const [atomDomain, setAtomDomain] = useState<string|null>(null);
    const [atomDescription, setAtomDescription] = useState("");
    const [createError, setCreateError] = useState<string|null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    if(!worldlineData || rootPath === undefined) return null;
    const handleCreate=(async(e)=>{
        e.preventDefault();
        if(!atomName.trim()){
            inputRef.current?.focus();
            return;
        }
        const atomContent:Omit<AtomMeta, 'id'|'createdAt'|'updatedAt'> = {
            description: atomDescription,
            domainId: atomDomain as DomainId
        }
        const createResult = await createAtom(atomContent, atomName.trim());
        if (createResult.status === 'error') {
            setCreateError(createResult.message);            
        }else{
            setCreateError(null);
            setAtomName('');
            setAtomDescription('');
            setAtomDomain(null);
        }
        
    });
    
    return (
        <form className={styles.createAtomForm} onSubmit={handleCreate}>
            <div className="errorInfo">{createError&&(<span >Błąd zapisu: {createError}</span>)}</div>
            <input type="text" placeholder="Nazwa" className="input" value={atomName} onChange={(e)=>setAtomName(e.target.value)} ref={inputRef}/>
            <input placeholder="Domena" list="domains" className="input" value={atomDomain??""} onChange={(e)=>setAtomDomain(e.target.value)} />

            <datalist id="domains">
                {domains&& domains.map((domain)=>(
                    <option key={domain.id}>{domain.name}</option>
                ))}//TODO: dodanie nowej domeny
            </datalist>
            
            <textarea placeholder="Opis" className='textarea'  value={atomDescription} onChange={(e)=>setAtomDescription(e.target.value)}/>
            <button type="submit">Zapisz</button>
        </form>
    )
}
