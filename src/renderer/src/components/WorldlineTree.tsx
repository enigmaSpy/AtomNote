import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { AtomsTree } from "./Garden/AtomsTree";

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
