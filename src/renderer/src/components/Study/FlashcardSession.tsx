import { useStudyStore } from "@renderer/store/studyStore"
import { useState } from "react";
import styles from './study.module.css'
export const FlashcardSession = () => {
    const flashcards = useStudyStore(state=>state.flashcards);
    //const isLoading = useStudyStore(state=>state.isLoading);
    //const flashcardsError = useStudyStore(state=>state.error);
    const [unknowCards,setUnknownCards] = useState([...flashcards]);
    const [isFrontCard, setIsFrontCard] = useState(false);
    const [cardPointer, setCardPointer] = useState(0);
    const [round, setRound]=useState(0);

    if (flashcards.length<=0){
        return (
            <div>
                Brak zestawu do nauki
            </div>
        )
    }
    const clearUnknownCards =(knownIds: string[], unknownCards)=>{
        
        const newUnknown = unknownCards.filter(item=> !knownIds.includes(item.id));
        setUnknownCards(newUnknown)
        
    }
    const flashcardsState = {
        knownIds: [] as string[],
        nextCardHandler: function(known:boolean){
            if(unknowCards.length<=0) return;
            if(known) this.knownIds.push(unknowCards[cardPointer]!.id)
            if(cardPointer+1>=unknowCards.length){
                setCardPointer(0);
                setRound(prev=>prev+1);
                clearUnknownCards(this.knownIds, unknowCards)
            }else{
                setCardPointer((prev)=>prev+1);
            }
            console.log(unknowCards);
            
        }
    }
    return (
        <div className={styles.studyCover}>
            Pozostało: {unknowCards.length}
            <h2>Rudna: {round}</h2>
            {unknowCards.length<=0?
            (
                <div>
                    <button>Zacznij od nowa!</button>
                </div>
            ):(
                <>
                    <div
                    className={styles.flashcard}
                        onClick={()=>setIsFrontCard(prev=>!prev)}
                    >
                        {isFrontCard? (unknowCards[cardPointer]?.front):(unknowCards[cardPointer]?.back)}
                    </div>
                    <div>
                        <button onClick={()=>flashcardsState.nextCardHandler(false)}>
                            Nie wiem
                        </button>
                        <button onClick={()=>flashcardsState.nextCardHandler(true)}>
                            Wiem
                        </button>
                    </div>
                </>
            )
        }
        </div>
    )
}
