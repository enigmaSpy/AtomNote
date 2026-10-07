import { useStudyActions, useStudyStore } from '@renderer/store/studyStore'
import styles from './Study.module.css'
import { useRef, useState } from 'react';
import { useWorldlineStore } from '@renderer/store/worldlineStore';
export const FlashcardsPreview = ({ onClose }) => {
  type Side = 'front'|'back';
  
  const currentPath = useWorldlineStore(state => state.currentPath);
  const currentElectronId = useWorldlineStore(state => state.activeElectronId);

  const flashcards = useStudyStore((state) => state.flashcards);
  const {addStudyData, deleteStudyData, editStudyData} = useStudyActions();

  const [searchInput, setSearchInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');


  const [newFlashcard, setNewFlashcard] = useState({ front: "", back: "" });
  const  front = useRef<HTMLTextAreaElement>(null);
  const  back = useRef<HTMLTextAreaElement>(null);
  const textareaRefs ={
    front,
    back
  }
  const focus=(side:Side)=>textareaRefs[side].current?.focus();

  const addHandler=(e)=>{
    e.preventDefault();
    if (!newFlashcard.front.trim()) { focus('front'); return; }
    if (!newFlashcard.back.trim())  { focus('back');  return; }

    addStudyData({ ...newFlashcard }, 'flashcards');
    setNewFlashcard({ front: "", back: "" });
    focus('front');
  }  

  const deleteHandler =(cardId:string, e)=>{
    e.preventDefault();
    if(!currentPath || !currentElectronId) return;
    deleteStudyData(cardId, 'flashcards')
  }
  
const cancleEditHandle=()=>{
    setEditingId('');
    setIsEditMode(false);
    setNewFlashcard({ front:'', back: '' });
  }
  const setEditHandler =(cardId: string,e)=>{
    e.preventDefault();
    setIsEditMode(true);
    setEditingId(cardId);
    setNewFlashcard({ 
      front: flashcards.find(({id})=>id===cardId)!.front, 
      back: flashcards.find(({id})=>id===cardId)!.back
    });
  }
  const editHandler = (e)=>{
    e.preventDefault();
    if (!newFlashcard.front.trim()) { focus('front'); return; }
    if (!newFlashcard.back.trim())  { focus('back');  return; }
    const content = {
      front: newFlashcard.front,
      back: newFlashcard.back
    }
    if(!currentPath || !currentElectronId) return;
    editStudyData(content, editingId, 'flashcards')
    cancleEditHandle()
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
            className='textarea'
            rows={2} 
            placeholder="Przód (pytanie / pojęcie)" 
            ref={textareaRefs.front}
            value={newFlashcard.front}
            onChange={(e) => setNewFlashcard(prev => ({ ...prev, front: e.target.value }))}
          />
            
          <textarea
            className='textarea'
            rows={2}
            placeholder="Tył (odpowiedź / pojęcie)" 
            ref={textareaRefs.back}
            value={newFlashcard.back}
            onChange={(e) => setNewFlashcard(prev => ({ ...prev, back: e.target.value }))}
          />
        </div>
        {!isEditMode?(
          <button className={styles.submitButton}
            onClick={(e)=>addHandler(e)}
          >
            Dodaj fiszkę
          </button>
        ):(
          <div className={styles.editButtonsWrapper}>
            <button className={styles.Button}
              onClick={()=>cancleEditHandle()}
            >
              Anuluj
            </button>
            <button className={styles.submitButton}
              onClick={(e)=>editHandler(e)}
            >
              Aktualizuj fiszkę
            </button>
          </div>
        )}
      </form>


      <div className={styles.searchWrapper}>
          <input 
            className="searchInput" 
            placeholder="Szukaj fiszek..." 
            onChange={(e)=>setSearchInput(e.target.value)}
          />

        </div>
      <div className={styles.listSection}>
        <div className={styles.cardsList}>
          {flashcards
            .filter(({id})=>id!==editingId)
            .filter(({front, back})=>front.includes(searchInput) || back.includes(searchInput))
            .map((flashcard) => (
            <div key={flashcard.id} className={styles.flashcardItem}>
              <div className={styles.cardContent}>
                <div className={styles.cardFront}>{flashcard.front}</div>
                <div className={styles.cardBack}>{flashcard.back}</div>
              </div>
              
              <div className={styles.manageWrapper}>
                <span className={styles.masteryBadge}>mastery: {flashcard.mastery}</span>
                <div className={styles.buttonsWrapper}>
                  <button className={styles.deleteButton} onClick={(e)=>deleteHandler(flashcard.id, e)}>🗑️</button>
                  <button className={styles.editButton} onClick={(e)=>setEditHandler(flashcard.id, e)}>✏️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
