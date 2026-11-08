import type { StudyItemEntry, StudyItemEntryEdit, StudyType } from "@shared/domain/study";
import type { Status } from "@shared/domain/types";
import type { Flashcard } from "@shared/schemas/flashcard";
import type { FlashcardId, QuizId } from "@shared/schemas/ids";
import type { QuizQuestion } from "@shared/schemas/quiz";
import { create } from "zustand";
import { useWorldlineStore } from "./worldlineStore";

interface StudyStoreActions{
    loadStudyData: ()=> Promise<void>;
    clearStudyData: ()=>void;
    addStudyData: (payload: StudyItemEntry)=>Promise<Status>;
    deleteStudyData: (targetId:FlashcardId|QuizId, target:StudyType)=>Promise<Status>;
    editStudyData:(target: StudyItemEntryEdit,targetId:string,)=>Promise<Status>;
}
interface StudyStore {
    flashcards: Flashcard[];
    quizzes: QuizQuestion[];
    isLoading: boolean;
    error: string|null;

    actions: StudyStoreActions;
}
export const useStudyStore = create<StudyStore>((set, get)=>({
    flashcards: [],
    quizzes: [],
    isLoading: false,
    error: null,

    actions:{
        loadStudyData: async ()=>{
            const {worldlineData, atomPointer} = useWorldlineStore.getState();
            if(!worldlineData?.worldline) return; //TODO: Trza dodać jakiś typ            
            
            const activeElectronId = atomPointer.electronId;
            const activeAtomId = atomPointer.atomId;
            const rootPath = worldlineData?.worldline.rootPath;
            if (! rootPath|| !activeElectronId||!activeAtomId){
                set({flashcards:[], quizzes:[], isLoading: false});
                return; //!
            }
            set({
                isLoading:true, error:null
            });
            try {
                const atomName = worldlineData.worldline.atoms[activeAtomId]?.name;
                if(!atomName) return; //!
                const readResult = await window.api.study.read(rootPath,atomName, activeElectronId);
                if(readResult.status === 'error'){
                    set({
                        error: readResult.code
                    })
                    return
                }
                set({
                    flashcards: readResult.data.flashcards,
                    quizzes: readResult.data.quizzes,
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
        addStudyData: async(payload)=>{
            const {worldlineData, atomPointer} = useWorldlineStore.getState();

            const rootPath = worldlineData?.worldline.rootPath;
            const activeAtomId = atomPointer.atomId;
            const activeElectronId = atomPointer.electronId;

            if(!rootPath || !activeElectronId || !activeAtomId) return {
                status: 'error',
                code: 'ERR_PATH_NOT_FOUND'
            }
            const atomName = worldlineData.worldline.atoms[activeAtomId]?.name;
            if(!atomName) return{
                status: 'error',
                code: 'ERR_ATOM_NOT_FOUND'
            }

            const studyAddResult = await window.api.study.add(rootPath, atomName, activeElectronId, payload);
            if(studyAddResult.status === 'error'){
                return studyAddResult;
            }
            const newData = studyAddResult.data;
            set((state)=>{
                if (payload.kind === 'flashcards') {
                    return {
                        flashcards: [newData as Flashcard, ...state.flashcards],
                    };
                }
                return {
                    quizzes: [newData as QuizQuestion, ...state.quizzes],
                };
            });
            return {status: 'ok'}
        },
        deleteStudyData: async(targetId, target)=>{
            const {worldlineData, atomPointer} = useWorldlineStore.getState();
            const rootPath = worldlineData?.worldline.rootPath;
            const activeAtomId = atomPointer.atomId;
            if(!activeAtomId) return{
                status: 'error',
                code: 'ERR_ATOM_NOT_FOUND'
            }
            const atomName = worldlineData?.worldline.atoms[activeAtomId]?.name
            const activeElectronId = atomPointer.electronId;
            if(!rootPath || !activeElectronId ||!atomName) return{
                status: 'error',
                code: 'ERR_PATH_NOT_FOUND'
            }
            const prev = get()[target];

            set({
                [target]: prev.filter(({id})=>id!==targetId),
            })
            const deleteResult = await window.api.study.delete(rootPath, atomName, activeElectronId, targetId, target);
            if (deleteResult.status === 'error') {
                set({
                    [target]:prev,
                });
                return {
                    status: 'error',
                    code: 'ERR_DELETE_FAILED'
                }
            }
            return{ status: 'ok'}
        },
        editStudyData: async(payload, targetId)=> {
            const {worldlineData, atomPointer} = useWorldlineStore.getState();
            const rootPath = worldlineData?.worldline.rootPath;
            const activeAtomId = atomPointer.atomId;
            if(!activeAtomId) return{
                status: 'error',
                code: 'ERR_ATOM_NOT_FOUND'
            }
            const atomName = worldlineData?.worldline.atoms[activeAtomId]?.name
            const activeElectronId = atomPointer.electronId;
            if(!rootPath || !activeElectronId ||!atomName) return{
                status: 'error',
                code: 'ERR_PATH_NOT_FOUND'
            }
            const prev = get()[payload.kind];

            set({
                [payload.kind]: prev.map((item) =>
                item.id === targetId
                    ? { ...item, ...payload.content }
                    : item
                ),
            });
            const editResult = await window.api.study.edit(rootPath, atomName, activeElectronId, targetId, payload);
            if(editResult.status ==='error'){
                set({
                    [payload.kind]: prev,
                });
                return editResult;
            }
            return {status: 'ok'}
        },
    }
}));
export const useStudyActions = ()=> useStudyStore((state)=>state.actions);