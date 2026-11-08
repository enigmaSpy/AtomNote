import { writeJsonWithSchema } from "@main/utils/json";
import { getFullStudyData } from "./electron-study-read";
import { FlashcardsDictSchema, type Flashcard } from "@shared/schemas/flashcard";
import { join } from "path";
import { QuizzesDictSchema, type QuizQuestion } from "@shared/schemas/quiz";
import type { Status } from "@shared/domain/types";
import { randomUUID } from "crypto";
import type { FlashcardId, QuizId } from "@shared/schemas/ids";
import type { StudyItemEntry } from "@shared/domain/study";

export async function addElectronStudyData(rootPath: string, atomName: string, electronId:string, payload:StudyItemEntry):Promise<Status<Flashcard|QuizQuestion>>{
    const fileName = payload.kind==='flashcards'? 'flashcards.json' : 'quizzes.json';
    const atomPath = join(rootPath, atomName)

    const studyResult = await getFullStudyData(atomPath, payload.kind);
    if(studyResult.status === 'error') return studyResult;

    const atomStudyPath = join(atomPath, '__study__', fileName);
    const newId = randomUUID();
    if (payload.kind === 'flashcards') {
        
        const flashcardDict = studyResult.data;
        const contentToAdd:Flashcard = {
            id: newId as FlashcardId,
            mastery: 0,
            ...payload.content
        }
        flashcardDict[electronId] ??= {cards:[]};
        flashcardDict[electronId].cards.push(contentToAdd);
        
        const savingResult = await writeJsonWithSchema(atomStudyPath, FlashcardsDictSchema, flashcardDict);
        if(savingResult.status ==='invalid'){
            return {
                status:'error', 
                code: 'ERR_FLASHCARD_INVALID',
                details: `${savingResult.status} - ${atomStudyPath}`
            }
        }else if(savingResult.status === 'write-failed'){
            return {
                status: 'error',
                code: 'ERR_FLASHCARD_WRITE_FAILED',
                details: `${savingResult.status} - ${atomStudyPath}`
            }
        }
        return {status: 'ok', data: contentToAdd}
    }else{
        const quizzesDict = studyResult.data;
        const contentToAdd: QuizQuestion={
            id: newId as QuizId,
            mastery: 0,
            ...payload.content 
        }
        quizzesDict[electronId] ??= {questions: []}; 
        quizzesDict[electronId].questions.push(contentToAdd);

        const savingResult = await writeJsonWithSchema(atomStudyPath, QuizzesDictSchema, quizzesDict);
        if(savingResult.status ==='invalid'){
            return {
                status:'error', 
                code: 'ERR_QUIZ_INVALID',
                details: `${savingResult.status} - ${atomStudyPath}`
            }
        }else if(savingResult.status === 'write-failed'){
            return {
                status: 'error',
                code: 'ERR_QUIZ_WRITE_FAILED',
                details: `${savingResult.status} - ${atomStudyPath}`
            }
        }
        return {status: 'ok', data: contentToAdd}
    }
}