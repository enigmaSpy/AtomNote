import type { StudyItemEntry, StudyItemEntryEdit, StudyItemsPacket, StudyType } from "@shared/domain/study";
import type { Status } from "@shared/domain/types";
import type { FlashcardId, QuizQuestionId } from "@shared/schemas/ids";
import { create } from "zustand";
import { useWorldlineStore } from "./worldlineStore";
import { immer } from "zustand/middleware/immer";

interface StudyStoreActions{
    loadStudyData: ()=> Promise<void>;
    clearStudyData: ()=>void;
    addStudyData: (payload: StudyItemEntry)=>Promise<Status>;
    deleteStudyData: (targetId:FlashcardId|QuizQuestionId, target:StudyType)=>Promise<Status>;
    editStudyData:(target: StudyItemEntryEdit,targetId:FlashcardId|QuizQuestionId,)=>Promise<Status>;
}

interface StudyStore extends StudyItemsPacket{
    isLoading: boolean;
    error: string|null;
    actions: StudyStoreActions;
}
export const useStudyStore = create<StudyStore>()(immer((set, get)=>({
    flashcards: {},
    quizzes: {},
    lastStudiedAt: {
        flashcards: null,
        quizzes: null
    },
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
                set({
                    flashcards:{}, 
                    quizzes:{}, 
                    isLoading: false
                });
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
                    lastStudiedAt: readResult.data.lastStudiedAt
                });
            } catch (error) {
                set({
                    flashcards: {},
                    quizzes: {},
                    error: (error as Error).message
                });   
            }finally{
                set({isLoading: false});
            }
        },
        clearStudyData:()=> {
            set({
                flashcards: {},
                quizzes: {},
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
            const studyData = studyAddResult.data;
            const studyTarget = payload.kind
            const studyId = studyData.id;
            set((state)=>{
                state[studyTarget][studyId] = studyData;
            })
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
            const backupItem = get()[target][targetId];
            
            set((state)=>{
                delete state[target][targetId]
            });
            const deleteResult = await window.api.study.delete(rootPath, atomName, activeElectronId, targetId, target);
            if (deleteResult.status === 'error') {
                set((state)=>{ state[target][targetId] = backupItem});
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
            const backupItem = get()[payload.kind][targetId];
            set((state)=>{
                state[payload.kind][targetId] ={
                    id: targetId,
                    ...payload.content
                }
            })
            const editResult = await window.api.study.edit(rootPath, atomName, activeElectronId, targetId, payload);
            if(editResult.status ==='error'){
                set((state)=>{state[payload.kind][targetId] = backupItem});
                return editResult;
            }
            return {status: 'ok'}
        },
    }
})));
export const useStudyActions = ()=> useStudyStore((state)=>state.actions);