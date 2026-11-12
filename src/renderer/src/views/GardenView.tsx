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
import { GlobalContextMenu } from "@renderer/components/worldline/GlobalContextMenu"

/**
 * Widok Ogrodu
 * 
 * @returns Zwraca wiodok Ogrodu (Notatki ustrukturyzwne)
 */
export const GardenView = () => {
  const activeModal = useUIStore(state=>state.activeModal);
  const sidePanel = useUIStore(state=>state.sidePanel);
  const {setModalType} = useUIActions();

  const atomPointer = useWorldlineStore(state => state.atomPointer);
  

  //TODO: Przenieść logikę renderowania Grafu do głównego widoku
  return (
      <StudySyncManager>
      <GlobalContextMenu/>
      <Modal isOpen={activeModal !==null} onClose={()=>setModalType(null)}>
        {activeModal === 'createAtom' && <CreateAtomModal />}
        {activeModal === 'flashcardsSession' && <FlashcardSession />}
        {activeModal === 'quizzesSession' && <QuizPreview />}
      </Modal>
      <main className={styles.gardenView}>
          <WorldlineLeftBar collapsed={sidePanel!=='meta'}/>
          {atomPointer.electronId? (
            <>
                <NoteEditor/>
                {sidePanel === 'flashcardsPreview' && <FlashcardsPreview />}
                {sidePanel === 'meta' && <NoteMeta />}
                {sidePanel === 'quizzesPreview' && <QuizPreview />}
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
