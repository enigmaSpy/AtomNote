import { useState } from "react"
import { NoteMeta } from "../components/editor/NoteMeta"
import { NoteEditor } from "../components/editor/NoteEditor"
import { WorldlineNav } from "../components/worldline/WorldlineNav"
import { StudySyncManager } from "../components/providers/StudySyncManager"
import { FlashcardSession } from "../components/study/FlashcardSession"
import { QuizPreview } from "../components/study/QuizPreview"
import { Modal } from "../components/ui/Modal"
import styles from './Garden.module.css'
import { useWorldlineState, useWorldlineStore } from "@renderer/store/worldlineStore"
import { WorldlineGraph } from "@renderer/components/graph/WorldlineGraph"
import { FlashcardsPreview } from "@renderer/components/study/FlashcardsPreview"
import clsx from "clsx"
import { CreateAtomModal } from "@renderer/components/worldline/CreateAtomModal"
type StudyType = 'flashcards'|'quiz'|'flashcardsPreview'|null;

/**
 * Widok Ogrodu
 * 
 * @returns Zwraca wiodok Ogrodu (Notatki ustrukturyzwne)
 */
export const GardenView = () => {
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [studyType, setStudyType] = useState<StudyType>(null);

  const activeElectronId = useWorldlineStore(state => state.activeElectronId);
  const isCreateAtomOpen = useWorldlineState(state => state.isCreateAtomOpen);
  const setIsCreateAtomOpen = useWorldlineState(state => state.setCreateAtomOpen);

  const openStudyModal = (type: Exclude<StudyType, null>)=>{
    setStudyType(type);
    setIsStudyOpen(true);
  }
  const closeStudyModal = ()=>{
    setStudyType(null);
    setIsStudyOpen(false);
  }
  

  //TODO: Przenieść logikę renderowania Grafu do głównego widoku
  return (
      <StudySyncManager>
      <Modal onClose={closeStudyModal} isOpen={isStudyOpen&&studyType!='flashcardsPreview'}>
        {studyType === 'flashcards' && <FlashcardSession />}
        {studyType === 'quiz' && <QuizPreview />}
      </Modal>
      <Modal onClose={()=>setIsCreateAtomOpen(false)} isOpen={isCreateAtomOpen}>
        <CreateAtomModal />
      </Modal>
      <main className={styles.gardenView}>
          <WorldlineNav 
            collapsed={studyType === 'flashcardsPreview'}
            onOpenCreateAtom={() => setIsCreateAtomOpen(true)}
          />
          {activeElectronId? (
            <>
                <NoteEditor/>
                {studyType==='flashcardsPreview'?(
                  <FlashcardsPreview onClose={closeStudyModal}/>
                  ):(
                  <NoteMeta onOpenStudy={openStudyModal}/>
                )}
            </>
          ):(
            <WorldlineGraph/>
          )}
      </main>
      <div>
        tutaj będzie mini terminal
      </div>
    </StudySyncManager>
  )
}
