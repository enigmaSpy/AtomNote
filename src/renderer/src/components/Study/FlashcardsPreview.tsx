import { useStudyActions, useStudyStore } from '@renderer/store/studyStore'
import styles from './Study.module.css'
import { useRef } from 'react';
export const FlashcardsPreview = ({ onClose }) => {
  type Side = 'front'|'back';
  const {addStudyData} = useStudyActions();
  const flashcards = useStudyStore((state) => state.flashcards);
  const newFlashcardRef = useRef({
    front: "",
    back: ""
  });
  const textareaRefs ={
    front: useRef<HTMLTextAreaElement>(null),
    back: useRef<HTMLTextAreaElement>(null),
  }
  const focus=(side:Side)=>textareaRefs[side].current?.focus();

  const addHandler=(e)=>{
    e.preventDefault();
    if(!newFlashcardRef.current.front) {
      focus('front');
      return;
    }
    if (!newFlashcardRef.current.back){
      focus('back');
      return;
    }
    
    addStudyData({
      front: newFlashcardRef.current.front,
      back:newFlashcardRef.current.back
    },'flashcards')
  }  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => onClose()}>
          ← Wróć
        </button>
      </div>

      <form className={styles.form}>
        <h2 className={styles.formTitle}>Dodaj nową fiszkę</h2>
        <div className={styles.inputsGroup}>
          <textarea 
            className={styles.textarea} 
            rows={2} 
            placeholder="Przód (pytanie / pojęcie)" 
            onChange={(e)=>newFlashcardRef.current.front = e.target.value}  
            ref={textareaRefs['front']}
          />
            
          <textarea
            className={styles.textarea}
            rows={2}
            placeholder="Tył (odpowiedź / definicja)"
            onChange={(e)=>newFlashcardRef.current.back = e.target.value}
            ref={textareaRefs['back']}
          />
        </div>
        <button className={styles.submitButton}
          onClick={(e)=>addHandler(e)}
        >
          Dodaj fiszkę
        </button>
      </form>


      <div className={styles.searchWrapper}>
          <input className="searchInput" placeholder="Szukaj fiszek..." />
        </div>
      <div className={styles.listSection}>
        <div className={styles.cardsList}>
          {flashcards.map((flashcard) => (
            <div key={flashcard.id} className={styles.flashcardItem}>
              <div className={styles.cardContent}>
                <div className={styles.cardFront}>{flashcard.front}</div>
                <div className={styles.cardBack}>{flashcard.back}</div>
              </div>
              <span className={styles.masteryBadge}>{flashcard.mastery}</span>
              <button>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
