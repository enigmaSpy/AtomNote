import type { FlashcardContent, ContentType, Status, StudyType } from "@shared/domain/types";
import { writeJsonWithSchema } from "@shared/utils/json";
import { join } from "path";
import { getFullStudyData } from "./electron-study-read";
import { FlashcardsDictSchema, type FlashcardsDict } from "@shared/schemas/flashcard";
import { QuizzesDictSchema, type QuizQuestion, type QuizzesDict } from "@shared/schemas/quiz";

export async function editStudyData(path: string, electronId: string, targerId:string, content: Partial<ContentType>, target: StudyType):Promise<Status>{
    const fileName = target === 'flashcards'? 'flashcards.json':'quizzes.json';
    const filePath = join(path, '__quiz__', fileName);
    const dataDict = await getFullStudyData(path, fileName);

    if(target === 'flashcards'){
        const flashcardsDict = dataDict as FlashcardsDict;
        const flashcardContent = content as Partial<FlashcardContent>;

        if (!flashcardsDict[electronId]) return {status: 'error', message: 'Fiszka nie istnieje (1)'};
        const searchIndex = flashcardsDict[electronId].cards.findIndex(({id})=>id===targerId);

        const card = flashcardsDict[electronId].cards[searchIndex];
        if (!card) return { status: 'error', message: 'Fiszka nie istnieje (2)' };

        flashcardsDict[electronId].cards[searchIndex] = {
            ...card,
            front: flashcardContent.front ?? card.front,
            back: flashcardContent.back ?? card.front,
        };

        const savingResult = await writeJsonWithSchema(filePath, FlashcardsDictSchema, flashcardsDict);
        if(savingResult.status !== 'ok'){
            return {status: 'error', message: `${savingResult.status}`};
        }
    }else{
        const quizzesDict = dataDict as QuizzesDict;
        const quizzesContent = content as Partial<QuizQuestion>;

        if (!quizzesDict[electronId]) return {status: 'error', message: 'Fiszka nie istnieje (1)'};
        const searchIndex = quizzesDict[electronId].questions.findIndex(({id})=>id===targerId);

        const card = quizzesDict[electronId].questions[searchIndex];
        if (!card) return { status: 'error', message: 'Fiszka nie istnieje (2)' };

        quizzesDict[electronId].questions[searchIndex] = {
            ...card,
            question: quizzesContent.question ?? card.question,
            answers: quizzesContent.answers ?? card.answers,
            correctAnswerIndex: quizzesContent.correctAnswerIndex ?? card.correctAnswerIndex
        };

        const savingResult = await writeJsonWithSchema(filePath, QuizzesDictSchema, quizzesDict);
        if(savingResult.status !== 'ok'){
            return {status: 'error', message: `${savingResult.status}`};
        }
    }
    return {status: 'ok'}
}