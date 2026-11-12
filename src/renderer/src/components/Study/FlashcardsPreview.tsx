import { useStudyActions, useStudyStore } from '@renderer/store/studyStore'
import styles from './Study.module.css'
import { useMemo, useRef, useState } from 'react';
import { useWorldlineStore } from '@renderer/store/worldlineStore';
import type { FlashcardId } from '@shared/schemas/ids';
import type { ErrorCode } from '@shared/utils/errors';
import type { StudyItemEntry } from '@shared/domain/study';
import { useUIActions } from '@renderer/store/uiStore';
export const FlashcardsPreview = () => {
  type Side = 'front'|'back';
  
  const currentElectronId = useWorldlineStore(state => state.atomPointer.electronId);
  const {setSidePanel} = useUIActions();
  const flashcardsDict = useStudyStore((state) => state.flashcards);
  const {addStudyData, deleteStudyData, editStudyData} = useStudyActions();

  const [searchInput, setSearchInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<FlashcardId|null>();

  const [errorResultCode, setErrorResultCode] = useState<string|null>(null);


  const [newFlashcard, setNewFlashcard] = useState({ front: "", back: "" });
  const  front = useRef<HTMLTextAreaElement>(null);
  const  back = useRef<HTMLTextAreaElement>(null);
  const textareaRefs ={
    front,
    back
  }
  const focus=(side:Side)=>textareaRefs[side].current?.focus();
  const visibleCards = useMemo(()=>{
    const searchQuery = searchInput.toLowerCase();
    return Object.values(flashcardsDict).filter(({id, front, back})=>
      id!==editingId && (
        (front.toLowerCase().includes(searchQuery)) || (back.toLowerCase().includes(searchQuery))
      )
    )
  },[flashcardsDict, editingId, searchInput])
  const addHandler=async(e)=>{
    e.preventDefault();
    setErrorResultCode(null);
    if (!newFlashcard.front.trim()) { focus('front'); return; }
    if (!newFlashcard.back.trim())  { focus('back');  return; }

    const addResult = await addStudyData({
      kind: 'flashcards',
      content: {...newFlashcard} 
    });
    if(addResult.status === 'error'){
      setErrorResultCode(addResult.code);
    }else{
      setNewFlashcard({ front: "", back: "" });
    }
    focus('front');
  }  

  const deleteHandler =async(cardId, e)=>{
    e.preventDefault();
    setErrorResultCode(null);
    if(!currentElectronId){
      const error: ErrorCode = 'ERR_ELECTRON_NOT_FOUND';
      setErrorResultCode(error);
      return;
    };
    const deleteResult = await deleteStudyData(cardId, 'flashcards');
    if(deleteResult.status === 'error'){
      setErrorResultCode(deleteResult.code);
    }
  }
  
const cancleEditHandle=()=>{
    setEditingId(null);
    setIsEditMode(false);
    setNewFlashcard({ front:'', back: '' });
  }
  const setEditHandler =(cardId: FlashcardId,e: React.MouseEvent)=>{
    e.preventDefault();
    const targetCard = flashcardsDict[cardId];
    if(!targetCard) return;
    setIsEditMode(true);
    setEditingId(cardId);
    setNewFlashcard({ 
      front: targetCard.front, 
      back: targetCard.back
    });
  }
  const editHandler = async(e)=>{
    e.preventDefault();
    setErrorResultCode(null);
    if(!editingId){
      return
    }
    if (!newFlashcard.front.trim()) { focus('front'); return; }
    if (!newFlashcard.back.trim())  { focus('back');  return; }
    const content = {
      front: newFlashcard.front,
      back: newFlashcard.back
    }
    if(!currentElectronId){
      const error: ErrorCode = 'ERR_ELECTRON_NOT_FOUND';
      setErrorResultCode(error);
      return;
    };
    const payload:StudyItemEntry = {
      kind: 'flashcards',
      content
    }
  
    const editResult = await editStudyData(payload, editingId)
    if(editResult.status === 'error'){
      setErrorResultCode(editResult.code)
      return;
    }
    cancleEditHandle()
  }
  
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => setSidePanel('meta')}>
          ← Wróć
        </button>
      </div>
      <div>{errorResultCode}</div>
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
          {
            visibleCards.map((flashcard) => (
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
