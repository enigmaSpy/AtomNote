import { FlashcardsDictSchema, type Flashcard, type FlashcardsDict } from "@shared/schemas/flashcard";
import { QuizzesFileSchema, type QuizQuestion, type QuizzesDict } from "@shared/schemas/quiz";

import { getFullStudyData } from "./electron-study-read";
import { writeJsonWithSchema } from "@shared/utils/json";
import { join } from "path";

export async function addElectronStudyData(
    path: string,
    electronId: string,
    content: Flashcard[] | QuizQuestion[],
    target: 'flashcards' | 'quizzes'
):Promise<void>{
    const fileName = target === 'flashcards' ? 'flashcards.json' : 'quizzes.json';
    const dataDict = await getFullStudyData(path, fileName);
    if (!dataDict) return;
    if (target==='flashcards'){
        (dataDict as FlashcardsDict)[electronId]={
            cards: content as Flashcard[]
        }
        await writeJsonWithSchema(join(path, '__quiz__', fileName), FlashcardsDictSchema, dataDict)
    }else if(target==='quizzes'){
        (dataDict as QuizzesDict)[electronId]={
            questions: content as QuizQuestion[]
        }
        await writeJsonWithSchema(join(path, '__quiz__', fileName), QuizzesFileSchema, dataDict)
    }else{
        throw new Error(`Odrzucono zapis: Nieznany target "${target}"`);
    }

}


