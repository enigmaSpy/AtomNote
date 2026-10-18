import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore"
import styles from './Worldline.module.css'
import { useRef, useState } from "react";
import type { AtomMeta } from "@shared/schemas/atom";
import type { DomainId } from "@shared/schemas/ids";
export const CreateAtomModal = () => {
    const domains = useWorldlineStore(state=> state.worldlineData)?.worldline.domains;
    const worldlineData = useWorldlineStore(state => state.worldlineData)?.worldline;
    const {addAtom} = useWorldlineActions()

    const rootPath = worldlineData?.rootPath;
    const [atomName, setAtomName] = useState("");
    const [atomDomain, setAtomDomain] = useState<string|null>(null);
    const [atomDescription, setAtomDescription] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [writeResponse, setWriteResponse] = useState<string|null>(null);

    if(!worldlineData || rootPath === undefined) return null;
    const handleCreate=(async(e)=>{
        e.preventDefault();
        setWriteResponse(null);
        if(!atomName.trim()){
            inputRef.current?.focus();
            return;
        }
        const atomContent:Omit<AtomMeta, 'id'|'createdAt'|'updatedAt'> = {
            description: atomDescription,
            domainId: atomDomain as DomainId
        }
        const response = await window.api.atom.create(rootPath,atomName.trim(), atomContent);
        if (response.status === 'error') {
            setWriteResponse(response.message);
            inputRef.current?.focus();
        }
        if(response.status === 'ok'){
            const newAtomId = response.data.id;
            const newAtomData={
                name: atomName.trim(),
                meta: response.data,
                tags: new Set<string>(),
                mastery: 0,
                electrons: {},
                references: {
                    referencedAtoms: [],
                    referencedElectrons: {}
                },
                links: {}
            }
            addAtom(newAtomId, newAtomData);
            setAtomName('');
            setAtomDescription('');
            setAtomDomain(null);
        }
        
    })
    
    return (
        <form className={styles.createAtomForm}>
            <div className="errorInfo">{writeResponse&&(<span >Błąd zapisu: {writeResponse}</span>)}</div>
            <input type="text" placeholder="Nazwa" className="input" value={atomName} onChange={(e)=>setAtomName(e.target.value)} ref={inputRef}/>
            <input placeholder="Domena" list="domains" className="input" value={atomDomain??""} onChange={(e)=>setAtomDomain(e.target.value)} />

            <datalist id="domains">
                {domains&& domains.map((domain)=>(
                    <option key={domain.id}>{domain.name}</option>
                ))}//TODO: dodanie nowej domeny
            </datalist>
            
            <textarea placeholder="Opis" className='textarea'  value={atomDescription} onChange={(e)=>setAtomDescription(e.target.value)}/>
            <button onClick={(e)=>handleCreate(e)}>Zapisz</button>
        </form>
    )
}
