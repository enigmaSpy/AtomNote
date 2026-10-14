import { useWorldlineStore } from "@renderer/store/worldlineStore"
import styles from './Worldline.module.css'
export const CreateAtomModal = () => {
    const roles = useWorldlineStore(state=> state.worldlineData)?.worldline.domains;
    
    return (
        <form className={styles.createAtomForm}>
            <input type="text" placeholder="Nazwa" className="input"/>
            <input placeholder="Rola" list="role" className="input"/>

            <datalist id="role">
                {roles&& roles.map(({name})=>(
                    <option>{name}</option>
                ))}
            </datalist>
            
            <textarea placeholder="Opis" className='textarea'/>
            <button>Zapisz</button>
        </form>
    )
}
