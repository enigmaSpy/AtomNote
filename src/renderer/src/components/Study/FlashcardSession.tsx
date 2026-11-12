import { useStudyStore } from "@renderer/store/studyStore"
import { useState } from "react";
import styles from './study.module.css'
import { useStudySessionActions, useStudySessionStore } from "@renderer/store/studySessionStore";
import { useWorldlineStore } from "@renderer/store/worldlineStore";
import type { FlashcardId } from "@shared/schemas/ids";

export const FlashcardSession = () => {
    const {nextItem, startSession} = useStudySessionActions();
    const flashcards = useStudyStore(state=>state.flashcards)
    const activeElectronId=useWorldlineStore(state=>state.atomPointer.electronId);
    const session = useStudySessionStore(state=>state.sessions);
    const [isFrontCard, setIsFrontCard] = useState(true);
    
    if(!session || !activeElectronId) return null;
    const sessionQueue = session[activeElectronId]?.flashcards.queue
    const sessionInitialLength = session[activeElectronId]?.flashcards.initialCount;
    const round = session[activeElectronId]?.flashcards.round;
    if(!sessionQueue) return null;
    console.log(flashcards);
        
    const nextCardHandler=(isKnown:boolean)=>{
        setIsFrontCard(true);
        nextItem(activeElectronId, 'flashcards', isKnown);
    }
    const startNewSessionHandler=()=>{
        startSession(activeElectronId, {
            type: 'flashcards',
            ids: Object.keys(flashcards) as FlashcardId[]
        })
    }

    return (
        <div className={styles.studyCover}>
            Pozostało: {`${sessionQueue.length} z ${sessionInitialLength}`}
            <h2>Rudna: {round}</h2>
            <>    
                {sessionQueue.length !== 0 && sessionQueue[0]!==undefined?(
                    <div 
                        className={styles.flashcard}
                        onClick={()=>setIsFrontCard(prev=>!prev)}
                    >
                        {(isFrontCard?(
                            <span>{flashcards[sessionQueue[0]]?.front}</span>
                        ):(
                            <span>{flashcards[sessionQueue[0]]?.back}</span>
                        ))}
                    </div>
                ):(
                <div>
                    <button onClick={startNewSessionHandler}>Zacznij od nowa!</button>
                </div>
                )}
                {sessionQueue.length !== 0&&(
                    <div>
                        <button onClick={()=>nextCardHandler(false)}>
                            Nie wiem
                        </button>
                        <button onClick={()=>nextCardHandler(true)}>
                            Wiem
                        </button>
                    </div>
                )}
            </>
        </div>
    )
}
