import { useStudyStore } from '@renderer/store/studyStore';
import styles from './NoteEditor.module.css'
import { getCurrentFileName } from '@renderer/utils/currentFileName';
interface NoteMetaProps{
    onOpenStudy: (type: 'flashcards' | 'quiz' | 'flashcardsPreview')=>void;
}
/**
 * Widok ten jest panelem, który umożliwa odtworzenie, stworzenie, edycję i usunięcie pytań i fiszek.
 * Umożliwia podgląd mastery
 * 
 * @returns Widok danych wybranej notatki notatki
 */
export const  NoteMeta = ({onOpenStudy}:NoteMetaProps) => {
    const flashcards = useStudyStore(state=>state.flashcards);
    const quizzes = useStudyStore(state=>state.quizzes);
    const fileName = getCurrentFileName().electronName;
    return (
        <div className={styles.noteMeta}>
            <h3>{fileName}</h3>
            <div>
                <button onClick={()=>onOpenStudy('flashcardsPreview')}>
                    {flashcards[0]? "Edytuj Fiszki":"Stwórz Fiszki"}
                </button>
                {flashcards[0]? 
                    (
                        <button onClick={()=>onOpenStudy('flashcards')}>
                            ▶
                        </button>
                    ):
                    (null)
                }
            </div>

            <div>
                <button>
                    {quizzes[0]? "Edytuj Quiz":"Stwórz Quiz"}
                </button>
                {quizzes[0]? 
                    (
                        <button onClick={()=>onOpenStudy('quiz')}>
                            ▶
                        </button>
                    ):
                    (null)
                }
            </div>
        </div>
    )
}
