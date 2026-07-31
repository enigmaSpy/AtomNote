import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { AtomsTree } from "./AtomsTree";

export const WorldlineTree = () => {
    const { worldlineData, isLoading, actions } = useWorldlineStore();
    if (isLoading) return <div>Pobieranie struktury Atomów...</div>;

    return (
        <nav style={{width:'30vw', background:'red'}}>
            <button onClick={() => actions.loadWorldline('C:/dev/worldline-test')}>
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
