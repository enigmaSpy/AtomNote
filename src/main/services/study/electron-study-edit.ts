import { writeJsonWithSchema } from "@main/utils/json";
import { FlashcardsDiscSchema, type Flashcard } from "@shared/schemas/flashcard";
import { QuizzesDiscSchema, type QuizQuestion } from "@shared/schemas/quiz";
import { join } from "path";
import { fetchFullStudyData } from "./electron-study-read";
import type { StudyItemEntryEdit } from "@shared/domain/study";
import type { Status } from "@shared/domain/types";
import type { ElectronId, FlashcardId, QuizQuestionId } from "@shared/schemas/ids";

export async function editStudyData(rootPath: string, atomName: string, electronId: ElectronId, targetId:FlashcardId | QuizQuestionId, payload: StudyItemEntryEdit):Promise<Status>{
    const isFlashcards = payload.kind === 'flashcards';
    const fileName = isFlashcards? 'flashcards.json':'quizzes.json';
    const atomPath = join(rootPath, atomName)
    const filePath = join(atomPath, '__study__', fileName);
    const dataDict = await fetchFullStudyData(atomPath, payload.kind);

    if(dataDict.status === 'error') return dataDict;
    const studyData = dataDict.data;
    
    if (!studyData[electronId]) return {
            status: 'error', 
            code: isFlashcards?'ERR_FLASHCARD_NOT_FOUND':'ERR_QUIZ_NOT_FOUND',
            details: `${filePath}`
        };
    const searchIndex = studyData[electronId]?.items.findIndex(({id})=>id===targetId);
    if(searchIndex === -1) return{
        status: 'error', 
        code: isFlashcards?'ERR_FLASHCARD_NOT_FOUND':'ERR_QUIZ_NOT_FOUND',
        details: `${filePath}`
    }
    const studyItem = studyData[electronId].items[searchIndex];
    if(!studyItem) return{
        status: 'error', 
        code: isFlashcards?'ERR_FLASHCARD_NOT_FOUND':'ERR_QUIZ_NOT_FOUND',
        details: `${filePath}`
    }
    if(isFlashcards){
        const studyContent = payload.content;
        const flashcard = studyItem as Flashcard;
        studyData[electronId].items[searchIndex]={
            ...flashcard,
            front: studyContent.front ?? flashcard.front,
            back: studyContent.back ?? flashcard.back,
        }
    }else{
        const studyContent = payload.content;
        const QuizQuestion = studyItem as QuizQuestion
        studyData[electronId].items[searchIndex]={
            ...QuizQuestion,
            question: studyContent.question ?? QuizQuestion.question,
            answers: studyContent.answers ?? QuizQuestion.answers,
            correctAnswerIndex: studyContent.correctAnswerIndex ?? QuizQuestion.correctAnswerIndex
        }
    }
    const schema = isFlashcards? FlashcardsDiscSchema:QuizzesDiscSchema;
    const savingResult = await writeJsonWithSchema(filePath, schema, studyData);
    if(savingResult.status === 'write-failed'){
        return {
            status: 'error', 
            code: isFlashcards?'ERR_FLASHCARD_WRITE_FAILED': 'ERR_QUIZ_WRITE_FAILED',
            details: `${filePath}`
        };
    }else if(savingResult.status === 'invalid'){
            return {
                status: 'error', 
                code: isFlashcards?'ERR_FLASHCARD_INVALID':'ERR_QUIZ_INVALID', 
                details: `${filePath}`
            };
    }
    return {status: 'ok'}
}