import { writeJsonWithSchema } from "@main/utils/json";
import { FlashcardsDictSchema } from "@shared/schemas/flashcard";
import { QuizzesDictSchema } from "@shared/schemas/quiz";
import { join } from "path";
import { getFullStudyData } from "./electron-study-read";
import type { StudyItemEntryEdit } from "@shared/domain/study";
import type { Status } from "@shared/domain/types";

export async function editStudyData(rootPath: string, atomName: string, electronId: string, targetId:string, payload: StudyItemEntryEdit):Promise<Status>{
    const fileName = payload.kind === 'flashcards'? 'flashcards.json':'quizzes.json';
    const atomPath = join(rootPath, atomName)
    const filePath = join(atomPath, '__study__', fileName);
    const dataDict = await getFullStudyData(atomPath, payload.kind);
    if(dataDict.status === 'error') return dataDict;
    if(payload.kind === 'flashcards'){
        const flashcardsDict = dataDict.data;
        const flashcardContent = payload.content;

        if (!flashcardsDict[electronId]) return {
            status: 'error', 
            code: 'ERR_FLASHCARD_NOT_FOUND',
            details: `${filePath}`
        };
        const searchIndex = flashcardsDict[electronId].cards.findIndex(({id})=>id===targetId);

        const card = flashcardsDict[electronId].cards[searchIndex];
        if (!card) return {
            status: 'error', 
            code: 'ERR_FLASHCARD_NOT_FOUND',
            details: `${filePath}`
        };

        flashcardsDict[electronId].cards[searchIndex] = {
            ...card,
            front: flashcardContent.front ?? card.front,
            back: flashcardContent.back ?? card.front,
        };

        const savingResult = await writeJsonWithSchema(filePath, FlashcardsDictSchema, flashcardsDict);
        if(savingResult.status === 'write-failed'){
            return {status: 'error', code: 'ERR_FLASHCARD_WRITE_FAILED', details: `${filePath}`};
        }else if(savingResult.status === 'invalid'){
            return {status: 'error', code: 'ERR_FLASHCARD_INVALID', details: `${filePath}`};
        }
    }else{
        const quizzesDict = dataDict.data;
        const quizzesContent = payload.content

        if (!quizzesDict[electronId]) return {
            status: 'error', 
            code: 'ERR_QUIZ_NOT_FOUND',
            details: `${filePath}`
        };
        const searchIndex = quizzesDict[electronId].questions.findIndex(({id})=>id===targetId);

        const card = quizzesDict[electronId].questions[searchIndex];
        if (!card) if (!quizzesDict[electronId]) return {
            status: 'error', 
            code: 'ERR_QUIZ_NOT_FOUND',
            details: `${filePath}`
        };

        quizzesDict[electronId].questions[searchIndex] = {
            ...card,
            question: quizzesContent.question ?? card.question,
            answers: quizzesContent.answers ?? card.answers,
            correctAnswerIndex: quizzesContent.correctAnswerIndex ?? card.correctAnswerIndex
        };

        const savingResult = await writeJsonWithSchema(filePath, QuizzesDictSchema, quizzesDict);
        if(savingResult.status === 'write-failed'){
            return {status: 'error', code: 'ERR_QUIZ_WRITE_FAILED', details: `${filePath}`};
        }else if(savingResult.status === 'invalid'){
            return {status: 'error', code: 'ERR_QUIZ_INVALID', details: `${filePath}`};
        }
    }
    return {status: 'ok'}
}