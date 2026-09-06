import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { AtomsTree } from "./AtomsTree";
/**
 * Nawigacja plików (na razie statyczna ścieżka)
 * 
 * @returns Zwraca nawigację notatek 
 */
//TODO: Zmiana ścieżki statycznej na automatyczną
export const WorldlineTree = () => {
    const { worldlineData, isLoading, actions } = useWorldlineStore();
    if (isLoading) return <div className="cursor-progress">Pobieranie struktury Atomów...</div>;

    return (
        <nav style={{width:'18vw', background:'red'}}>
            <button 
                className="cursor-pointer"
                onClick={() => actions.loadWorldline('C:/dev/worldline-test')}>
                Załaduj Worldline
            </button>
            <div>
                {worldlineData?.worldline.atoms && (
                    <AtomsTree atoms={worldlineData.worldline.atoms} />
                )}
            </div>    
        </nav>
    );
}
