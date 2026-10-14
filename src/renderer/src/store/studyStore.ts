import type { FlashcardContent, QuizContent, ContentType, Flashcard, QuizQuestion, StudyType } from "@shared/domain/types";
import { create } from "zustand";
import { useWorldlineStore } from "./worldlineStore";



interface StudyStoryActions{
    loadStudyData: ()=> Promise<void>;
    clearStudyData: ()=>void;
    addStudyData: (content:ContentType, target:StudyType)=>void;
    deleteStudyData: (targetId:string, target:StudyType)=>void;
    editStudyData:(content: Partial<ContentType>,targetId:string, target: StudyType)=>void;
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
        addStudyData: async(content:ContentType, target:StudyType)=>{
            const {currentPath, activeElectronId} = useWorldlineStore.getState();
            if(!currentPath || !activeElectronId) return
            let newContent;
            if(target==='flashcards'){
                const flashcardContent = content as FlashcardContent;
                newContent ={
                    id: crypto.randomUUID(),
                    front: flashcardContent.front,
                    back: flashcardContent.back,
                    mastery: 0
                }                 
            }else{
                const quizContent = content as QuizContent;
                newContent ={
                    id: crypto.randomUUID(),
                    question: quizContent.question,
                    answers: quizContent.answers,
                    correctAnswerIndex: quizContent.correctAnswerIndex,
                    mastery: 0
                }                
            }
            const prev = get()[target];
            set({
                [target]: [...prev, newContent],
                error: null
            });
            const savingResult = await window.api.study.add(currentPath, activeElectronId, newContent, target);
            if (savingResult.status !== 'ok') {
                set({
                    [target]: prev,
                    error: savingResult.message
                })
            }

        },
        deleteStudyData: async(targetId, target)=>{
            const {currentPath, activeElectronId} = useWorldlineStore.getState();
            if(!currentPath || !activeElectronId) return;
            const prev = get()[target];

            set({
                [target]: prev.filter(({id})=>id!==targetId),
                error: null,
            })
            const deleteResult = await window.api.study.delete(currentPath, activeElectronId, targetId, target);
            if (deleteResult.status !== 'ok') {
                set({
                    [target]:prev,
                    error: deleteResult.message
                });
            }
        },
        editStudyData: async(content, targetId, target)=> {
            const {currentPath, activeElectronId} = useWorldlineStore.getState();
            if(!currentPath || !activeElectronId) return;
            const prev = get()[target];

            set({
                [target]: prev.map((item) =>
                item.id === targetId
                    ? { ...item, ...content }
                    : item
                ),
                error: null,
            });
            const editResult = await window.api.study.edit(currentPath, activeElectronId, targetId, content, target);
            if(editResult.status !=='ok'){
                set({
                    [target]: prev,
                    error:editResult.message
                });
            }
            
        },
    }
}));
export const useStudyActions = ()=> useStudyStore((state)=>state.actions);