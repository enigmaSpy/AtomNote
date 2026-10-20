import { useState } from "react"
import { NoteMeta } from "../components/editor/NoteMeta"
import { NoteEditor } from "../components/editor/NoteEditor"
import { WorldlineLeftBar} from "../components/worldline/WorldlineLeftbar"
import { StudySyncManager } from "../components/providers/StudySyncManager"
import { Modal } from "../components/ui/Modal"
import styles from './Garden.module.css'
import { useWorldlineStore } from "@renderer/store/worldlineStore"
import { WorldlineGraph } from "@renderer/components/graph/WorldlineGraph"
import { CreateAtomModal } from "@renderer/components/worldline/CreateAtomModal"

import { useUIActions, useUIStore } from "@renderer/store/uiStore"
import { FlashcardSession } from "@renderer/components/study/FlashcardSession"
import { QuizPreview } from "@renderer/components/study/QuizPreview"
import { FlashcardsPreview } from "@renderer/components/study/FlashcardsPreview"
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
  const isCreateAtomOpen = useUIStore(state => state.isCreateAtomOpen);
  const {setIsCreateAtomOpen} = useUIActions();

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
          <WorldlineLeftBar 
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
