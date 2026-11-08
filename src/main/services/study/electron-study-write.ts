import { FlashcardsDictSchema, type Flashcard, type FlashcardsDict } from "@shared/schemas/flashcard";
import { QuizzesDictSchema, type QuizQuestion, type QuizzesDict } from "@shared/schemas/quiz";

import { writeJsonWithSchema } from "@main/utils/json";
import { join } from "path";
import { getFullStudyData } from "./electron-study-read";
import type { StudyType } from "@shared/domain/study";

export async function writeElectronStudyData(
    rootPath: string, 
    atomName: string,
    electronId: string,
    content: Flashcard[] | QuizQuestion[],
    target: StudyType
):Promise<void>{
    const path = join(rootPath, atomName)
    const fileName = target === 'flashcards' ? 'flashcards.json' : 'quizzes.json';
    const dataDict = await getFullStudyData(path, target);
    if (!dataDict) return;
    if (target==='flashcards'){
        (dataDict as FlashcardsDict)[electronId]={
            cards: content as Flashcard[]
        }
        await writeJsonWithSchema(join(path, '__study__', fileName), FlashcardsDictSchema, dataDict)
    }else if(target==='quizzes'){
        (dataDict as QuizzesDict)[electronId]={
            questions: content as QuizQuestion[]
        }
        await writeJsonWithSchema(join(path, '__study__', fileName), QuizzesDictSchema, dataDict)
    }else{
        throw new Error(`Odrzucono zapis: Nieznany target "${target}"`);
    }
}


