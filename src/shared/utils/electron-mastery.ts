import { FlashcardsDictSchema } from "@shared/schemas/flashcard";
import { QuizzesFileSchema } from "@shared/schemas/quiz";
import { join } from "path";
import { readJsonWithSchema } from "./json";

//TODO: Do przeniesienia - kiedy ogarnę strukturę plików
/**
 * Funkcja oblicza mastery elektronu
 * 
 * @param electronID id Elektronu
 * @param atomPath ścieżka Atomu
 * @returns zwraca mastery elektonu
 */
export async function calculateElectronMastery(electronID: string, atomPath: string):Promise<number>{
    const mastery:Array<number>=[];
    const electronsFlashcardDic = await readJsonWithSchema(
        join(atomPath, '__quiz__','flashcards.json'),
        FlashcardsDictSchema,
    );

    let electronFlashcards = electronsFlashcardDic?.[electronID]
    if(electronFlashcards && electronFlashcards.cards.length>0){
        let total = electronFlashcards.cards.reduce((acc, cur)=> acc + cur.mastery,0)
        mastery.push(total/electronFlashcards.cards.length);
    }
    
    const electronsQuizDic = await readJsonWithSchema(
        join(atomPath, '__quiz__','quizzes.json'),
        QuizzesFileSchema, 
    );
    
    let electronQuizzes = electronsQuizDic?.[electronID]
    if(electronQuizzes && electronQuizzes.questions.length > 0){
        let total = electronQuizzes.questions.reduce((acc, cur)=>acc + cur.mastery,0)
        mastery.push(total/electronQuizzes.questions.length);
    }
    if(mastery.length <= 0) return 0;
    return mastery.reduce((acc,cur)=>acc+cur,0)/mastery.length;
}