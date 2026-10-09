import { useStudyStore } from "@renderer/store/studyStore"
import { useState } from "react";
import styles from './study.module.css'
export const FlashcardSession = () => {
    const flashcards = useStudyStore(state=>state.flashcards);
    //const isLoading = useStudyStore(state=>state.isLoading);
    //const flashcardsError = useStudyStore(state=>state.error);
    const [unknownCards,setUnknownCards] = useState([...flashcards]);
    const [isFrontCard, setIsFrontCard] = useState(false);
    const [cardPointer, setCardPointer] = useState(0);
    const [round, setRound]=useState(0);
    //const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

    if (flashcards.length<=0){
        return (
            <div>
                Brak zestawu do nauki
            </div>
        )
    }
   
    const newStudySession = ()=>{
        setUnknownCards([...flashcards]);
        setCardPointer(0);
        setRound(0);
    }

        
    const nextCardHandler=(known:boolean)=>{
        if(unknownCards.length === 0){
            //newStudySession()
            return;
        }
        let nextCards = unknownCards;
        let nextPointer = cardPointer;
        if(known){
            nextCards = unknownCards.filter((_, index)=> index !== cardPointer)
        }else{
            nextPointer = cardPointer +1;
        }
        if(nextPointer >= nextCards.length){
            if(nextCards.length === 0){
                newStudySession()
                return;
            }
            setRound(prev => prev + 1);
            setCardPointer(0);
        }else{
            setCardPointer(nextPointer);
        }
        if(known){
            setUnknownCards(nextCards);
        }
    }
    return (
        <div className={styles.studyCover}>
            <h3>Pointer karty: {cardPointer}</h3>
            Pozostało: {unknownCards.length}
            <h2>Rudna: {round}</h2>
            {unknownCards.length === 0?
            (
                <div>
                    <button onClick={()=>newStudySession()}>Zacznij od nowa!</button>
                </div>
            ):(
                <>
                    <div
                    className={styles.flashcard}
                        onClick={()=>setIsFrontCard(prev=>!prev)}
                    >
                        {isFrontCard? (unknownCards[cardPointer]?.front):(unknownCards[cardPointer]?.back)}
                    </div>
                    <div>
                        <button onClick={()=>nextCardHandler(false)}>
                            Nie wiem
                        </button>
                        <button onClick={()=>nextCardHandler(true)}>
                            Wiem
                        </button>
                    </div>
                </>
            )
        }
        </div>
    )
}
