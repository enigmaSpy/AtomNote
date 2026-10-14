import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { AtomsTree } from "./AtomsTree";
import styles from './Worldline.module.css'
import clsx from "clsx";
/**
 * Nawigacja plików (na razie statyczna ścieżka)
 * 
 * @returns Zwraca nawigację notatek 
 */
//TODO: Zmiana ścieżki statycznej na automatyczną
type Props = {
    collapsed?: boolean;
    className?: string;
    onOpenCreateAtom?: ()=>void;
}
export const WorldlineLeftBar = ({collapsed,className}:Props) => {
    const { worldlineData, isLoading, actions } = useWorldlineStore();
    if (isLoading) return <div className="cursor-progress">Pobieranie struktury Atomów...</div>;

    return (
        <nav className={clsx(styles.leftPanel, collapsed? styles.navCollapsed:styles.navOpen, className)}>
            <button 
                onClick={() => actions.loadWorldline('C:/dev/worldline-test')}>
                Załaduj Worldline
            </button>
            <div >
                {worldlineData?.worldline.atoms && (
                    <AtomsTree />
                )}
            </div>    
        </nav>
    );
}
