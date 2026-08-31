import type { Flashcard, QuizQuestion } from "@shared/domain/types";
import { create } from "zustand";

interface StudyStoryActions{
    loadStudyData: (rootPath:string,atomName:string, activeElectronId:string)=> Promise<void>;
    clearStudyData: ()=>void;
}
interface StudyStore {
    flashcards: Flashcard[];
    quizzes: QuizQuestion[];
    isLoading: boolean;
    error: string|null;

    actions: StudyStoryActions;
}
export const useStudyStore = create<StudyStore>((set)=>({
    flashcards: [],
    quizzes: [],
    isLoading: false,
    error: null,

    actions:{
        loadStudyData: async (rootPath, atomName, electronId)=>{
            set({isLoading:true, error:null});
            try {
                const data = await window.api.study.read(rootPath, atomName, electronId);
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
    }
}));
export const useStudyActions = ()=> useStudyStore((state)=>state.actions);