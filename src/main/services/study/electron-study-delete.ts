import { FlashcardsDictSchema, type FlashcardsDict } from "@shared/schemas/flashcard";
import { getFullStudyData } from "./electron-study-read";
import { writeJsonWithSchema } from "@shared/utils/json";
import { join } from "path";
import { QuizzesDictSchema, type QuizzesDict } from "@shared/schemas/quiz";
import type { Status, StudyType } from "@shared/domain/types";


export async function deleteElectronStudy(path: string, electronId:string, targetId: string, target: StudyType):Promise<Status>{
    const fileName = target === 'flashcards' ? 'flashcards.json' : 'quizzes.json';
    const dataDict = await getFullStudyData(path, fileName);
    const filePath = join(path, '__quiz__', fileName);

    if(target === 'flashcards'){
        const flashcardsDict = dataDict as FlashcardsDict;
        if (!flashcardsDict[electronId]) return {status: 'ok'};
        flashcardsDict[electronId].cards = flashcardsDict[electronId].cards.filter(({id})=>id!==targetId);
        
        const writeResult = await writeJsonWithSchema(filePath, FlashcardsDictSchema, flashcardsDict);
        if(writeResult.status !== 'ok'){
            return {status: 'error', message: `Błąd zapisu fiszek: ${writeResult.status}`}
        }
    }else if(target === 'quizzes'){
        const quizzesDict = dataDict as QuizzesDict;
        if (!quizzesDict[electronId]) return {status: 'ok'};
        quizzesDict[electronId].questions = quizzesDict[electronId].questions.filter(({id})=>id!==targetId);
        
        const writeResult = await writeJsonWithSchema(filePath, QuizzesDictSchema, quizzesDict);
        if(writeResult.status !== 'ok'){
            return {status: 'error', message: `Błąd zapisu fiszek: ${writeResult.status}`}
        }
    }
    return {status: 'ok'}
}