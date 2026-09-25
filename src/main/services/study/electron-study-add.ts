import { writeJsonWithSchema } from "@shared/utils/json";
import type { StudyItem } from "./types";
import { getFullStudyData } from "./electron-study-read";
import { FlashcardsDictSchema, type Flashcard, type FlashcardsDict } from "@shared/schemas/flashcard";
import { join } from "path";
import { QuizzesDictSchema, type QuizQuestion, type QuizzesDict } from "@shared/schemas/quiz";
import type { Status } from "@shared/domain/types";
//TODO: Normalizacja
export async function addElectronStudyData(path:string, electronId:string, content:StudyItem, target:'flashcards' | 'quizzes'):Promise<Status>{
    const fileName = target==='flashcards'? 'flashcards.json' : 'quizzes.json';
    const dataDict = await getFullStudyData(path, fileName);
    const filePath = join(path, '__quiz__', 'flashcards.json');

    if (target === 'flashcards') {
        
        const flashcardsDict = dataDict as FlashcardsDict;
        const contentToAdd = content as Flashcard;

        if (!flashcardsDict[electronId]) return {status: 'ok'};
        flashcardsDict[electronId].cards.push(contentToAdd);

        const savingResult = await writeJsonWithSchema(filePath, FlashcardsDictSchema, flashcardsDict);
        if(savingResult.status !== 'ok'){
            return {status: 'error', message: `${savingResult.status}`};
        }
    }else{
        
        const quizzesDict = dataDict as QuizzesDict;
        const contentToAdd = content as QuizQuestion;

        if (!quizzesDict[electronId]) return {status: 'ok'};
        quizzesDict[electronId].questions.push(contentToAdd);

        const savingResult = await writeJsonWithSchema(filePath, QuizzesDictSchema, quizzesDict);
        if(savingResult.status !== 'ok'){
            return {status: 'error', message: `${savingResult.status}`};
        }
    }
    return {status: 'ok'}
}