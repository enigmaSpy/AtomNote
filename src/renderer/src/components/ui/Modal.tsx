import { useEffect, useRef } from 'react'

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
        ref={dialogRef}
        onClose={onClose}
    >
        {children}
        <button
            onClick={onClose}
        >
            Zamknij
        </button>
    </dialog>
  )
}
