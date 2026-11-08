import { useStudyStore } from "@renderer/store/studyStore"
import { useState } from "react";
import styles from './study.module.css'
export const FlashcardSession = () => {
    const flashcards = useStudyStore(state=>state.flashcards);
    const [unknownCards,setUnknownCards] = useState([...flashcards]);
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
   
    const newStudySession = ()=>{
        setUnknownCards([...flashcards]);
        setCardPointer(0);
        setRound(0);
    }

        
    const nextCardHandler=(known:boolean)=>{
        if(known){
            
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
                        karty
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
