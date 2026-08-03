import { FlashcardsDictSchema } from "@shared/schemas/flashcard";
import { QuizzesFileSchema } from "@shared/schemas/quiz";
import { join } from "path";
import { readJsonWithSchema } from "../../../shared/utils/json";

/**
 * Funkcja oblicza mastery elektronu
 * 
 * @param electronID id Elektronu
 * @param atomPath ścieżka Atomu
 * @returns zwraca mastery elektonu
 */
export async function calculateElectronMastery(electronID: string, atomPath: string):Promise<number>{
    const mastery:Array<number>=[];
    const flashcardsRes = await readJsonWithSchema(
        join(atomPath, '__quiz__', 'flashcards.json'),
        FlashcardsDictSchema
    );

    const electronFlashcards = flashcardsRes.status === 'ok' 
        ? flashcardsRes.data[electronID] 
        : undefined;

    if (electronFlashcards && electronFlashcards.cards.length > 0) {
        const total = electronFlashcards.cards.reduce((acc, cur) => acc + cur.mastery, 0);
        mastery.push(total / electronFlashcards.cards.length);
    }
    
    const quizzesRes = await readJsonWithSchema(
        join(atomPath, '__quiz__', 'quizzes.json'),
        QuizzesFileSchema
    );

    const electronQuizzes = quizzesRes.status === 'ok' 
        ? quizzesRes.data[electronID] 
        : undefined;

    if (electronQuizzes && electronQuizzes.questions.length > 0) {
        const total = electronQuizzes.questions.reduce((acc, cur) => acc + cur.mastery, 0);
        mastery.push(total / electronQuizzes.questions.length);
    }

    if (mastery.length === 0) return 0;
    return mastery.reduce((acc, cur) => acc + cur, 0) / mastery.length;
}