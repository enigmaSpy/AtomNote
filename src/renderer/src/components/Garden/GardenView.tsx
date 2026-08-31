import { useState } from "react"
import { StudySyncManager } from "../providers/StudySyncManager"
import { WorldlineTree } from "../WorldlineTree"
import { NoteEditor } from "./NoteEditor"
import { NoteMeta } from "./NoteMeta"
import { Modal } from "../Modal"
import { FlashcardsPreview } from "../Study/FlashcardsPreview"
import { QuizPreview } from "../Study/QuizPreview"

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
        {studyType === 'flashcards' && <FlashcardsPreview />}
        {studyType === 'quiz' && <QuizPreview />}
      </Modal>
      <main style={{display:'flex'}}>
          <WorldlineTree/>
          <NoteEditor/>
          <NoteMeta onOpenStudy={openStudyModal}/>
      </main>
    </StudySyncManager>
  )
}
