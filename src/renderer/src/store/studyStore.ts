import type { Flashcard, QuizQuestion } from "@shared/domain/types";
import { create } from "zustand";
import { useWorldlineStore } from "./worldlineStore";

type ContentType = 'flashcards' | 'quizzes'
interface ContentFlashcard {
    front: string;
    back: string;
}
interface ContentQuiz{
    id: string;
    question: string;
    answers: string[];
    correctAnswerIndex: number[];
    mastery: number;
}
interface StudyStoryActions{
    loadStudyData: ()=> Promise<void>;
    clearStudyData: ()=>void;
    addStudyData: (content:ContentQuiz | ContentFlashcard, target:ContentType)=>void;
    deleteStudyData: (content:string, target:ContentType)=>void;
}
interface StudyStore {
    flashcards: Flashcard[];
    quizzes: QuizQuestion[];
    isLoading: boolean;
    error: string|null;

    actions: StudyStoryActions;
}
export const useStudyStore = create<StudyStore>((set, get)=>({
    flashcards: [],
    quizzes: [],
    isLoading: false,
    error: null,

    actions:{
        loadStudyData: async ()=>{
            const {currentPath, activeElectronId} = useWorldlineStore.getState();
            if (!currentPath || !activeElectronId){
                set({flashcards:[], quizzes:[], isLoading: false});
                return;
            }
            set({isLoading:true, error:null});
            try {
                const data = await window.api.study.read(currentPath, activeElectronId);
                set({
                    flashcards: data.flashcards,
                    quizzes: data.quizzes,
                });
            } catch (error) {
                set({
                    flashcards: [],
                    quizzes: [],
                    error: (error as Error).message
                });   
            }finally{
                set({isLoading: false});
            }
        },
        clearStudyData:()=> {
            set({
                flashcards: [],
                quizzes: [],
                error: null,
                isLoading: false
            });
        },
        addStudyData: (content:ContentQuiz | ContentFlashcard, target:ContentType)=>{
            const {currentPath, activeElectronId} = useWorldlineStore.getState();

            if(target === 'flashcards'){
                const flashcardContent = content as ContentFlashcard
                const {flashcards} = get();
                set({
                    flashcards: [
                        ...flashcards,
                        {
                            id: crypto.randomUUID(),
                            front: flashcardContent.front,
                            back: flashcardContent.back,
                            mastery: 0
                        }
                    ]
                });
                const {flashcards: newFlashcards} = get()
                try {
                    if (!currentPath) {
                        throw new Error('Aktualna ścieżka jest pusta/nie istnieje')
                    }
                    if(!activeElectronId){
                        throw new Error('Błąd elektronu, nie ma aktywnego ID')
                    }
                    window.api.study.add(currentPath, activeElectronId, newFlashcards, 'flashcards')
                } catch (error) {
                    set({error: (error as Error).message})
                    console.error("Nie można zapisać fiszki: ", error);
                }
            }
            if(target === 'quizzes'){
                const quizContent = content as ContentQuiz;
                const {quizzes} = get();
                set({
                    quizzes: [
                        ...quizzes,
                        {
                            id: crypto.randomUUID(),
                            question: quizContent.question,
                            answers: quizContent.answers,
                            correctAnswerIndex: quizContent.correctAnswerIndex,
                            mastery: 0
                        }
                    ]
                })
            }
            
        },
        deleteStudyData: ()=>{
            
        }
    }
}));
export const useStudyActions = ()=> useStudyStore((state)=>state.actions);