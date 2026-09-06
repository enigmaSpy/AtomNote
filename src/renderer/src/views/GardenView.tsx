import { useState } from "react"
import { NoteMeta } from "../components/editor/NoteMeta"
import { NoteEditor } from "../components/editor/NoteEditor"
import { WorldlineTree } from "../components/worldline/WorldlineTree"
import { StudySyncManager } from "../components/providers/StudySyncManager"
import { FlashcardSession } from "../components/study/FlashcardSession"
import { QuizPreview } from "../components/study/QuizPreview"
import { Modal } from "../components/ui/Modal"
import styles from './Garden.module.css'
type StudyType = 'flashcards'|'quiz'|null;
/**
 * Widok Ogrodu
 * 
 * @returns Zwraca wiodok Ogrodu (Notatki ustrukturyzwne)
 */
export const GardenView = () => {
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [studyType, setStudyType] = useState<StudyType>(null);

  const openStudyModal = (type: Exclude<StudyType, null>)=>{
    setStudyType(type);
    setIsStudyOpen(true);
  }
  const closeStudyModal = ()=>{
    setStudyType(null);
    setIsStudyOpen(false);
  }
  return (
    <StudySyncManager>
      <Modal onClose={closeStudyModal} isOpen={isStudyOpen}>
        {studyType === 'flashcards' && <FlashcardSession />}
        {studyType === 'quiz' && <QuizPreview />}
      </Modal>
      <main className={styles.gardenView}>
          <WorldlineTree/>
          <NoteEditor/>
          <NoteMeta onOpenStudy={openStudyModal}/>
      </main>
    </StudySyncManager>
  )
}
