import { useStudyStore } from '@renderer/store/studyStore';
import styles from './NoteEditor.module.css'
import { NoteTags } from './NoteTags';
import { useActiveElectronName } from '@renderer/hooks/useActiveElectronName';
import { useWorldlineStore } from '@renderer/store/worldlineStore';
import { useStudySessionActions, useStudySessionStore, type StartSessionPayload } from '@renderer/store/studySessionStore';
import type { FlashcardId, QuizQuestionId } from '@shared/schemas/ids';
import type { StudyType } from '@shared/domain/study';
import { useUIActions } from '@renderer/store/uiStore';

/**
 * Widok ten jest panelem, który umożliwa odtworzenie, stworzenie, edycję i usunięcie pytań i fiszek.
 * Umożliwia podgląd mastery
 * 
 * @returns Widok danych wybranej notatki notatki
 */
export const  NoteMeta = () => {
    const activeElectronId = useWorldlineStore(state=>state.atomPointer.electronId);
    const flashcards = useStudyStore(state=>state.flashcards);
    const isFlashcardEmpty = Object.keys(flashcards).length === 0;
    const quizzes = useStudyStore(state=>state.quizzes);
    const isQuizEmpty = Object.keys(quizzes).length === 0;
    const {startSession}=useStudySessionActions();
    const session = useStudySessionStore(s=>s.sessions)
    const {setSidePanel, setModalType} = useUIActions();
    const fileName = useActiveElectronName();
    console.log(flashcards);
    
    const handleStartSession=(targetType: StudyType)=>{
        if (!activeElectronId) return;
        const payload: StartSessionPayload = targetType === 'flashcards'
                ?{
                    type: 'flashcards',
                    ids: Object.keys(flashcards) as FlashcardId[],
                }:{
                    type: 'quizzes',
                    ids: Object.keys(quizzes) as QuizQuestionId[],
                };
        setModalType('flashcardsSession');
        startSession(activeElectronId, payload);
    }
    console.log(session);
    
    return (
        <div className={styles.noteMeta}>
            <h3>{fileName??"Błąd odczytu nazwy atomu"}</h3>
            <NoteTags/>
            <div>
                <button onClick={()=>setSidePanel('flashcardsPreview')}>
                    {!isFlashcardEmpty  ? "Edytuj Fiszki":"Stwórz Fiszki"}
                </button>
                {!isFlashcardEmpty? 
                    (
                        <button onClick={()=>handleStartSession('flashcards')}>
                            ▶
                        </button>
                    ):
                    (null)
                }
            </div>

            <div>
                <button>
                    {!isQuizEmpty? "Edytuj Quiz":"Stwórz Quiz"}
                </button>
                {!isQuizEmpty? 
                    (
                        <button onClick={()=>setSidePanel('quizzesPreview')}>
                            ▶
                        </button>
                    ):
                    (null)
                }
            </div>
        </div>
    )
}
