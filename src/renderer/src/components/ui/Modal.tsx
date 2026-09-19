import { useEffect, useRef } from 'react'
import styles from './Ui.module.css'
export const Modal = ({isOpen, onClose, children}) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    useEffect(()=>{
        const dialog = dialogRef.current;
        if(!dialog) return;

        if(isOpen){
            dialog.showModal();
        }else{
            dialog.close();
        }
    },[isOpen])
  return (
    <dialog
        className={styles.modal}
        ref={dialogRef}
        onClose={onClose}
    >
        {children}
        <button
            className={styles.exit}
            onClick={onClose}
        >
            X
        </button>
    </dialog>
  )
}
