import { FlashcardsFileSchema } from "@shared/schemas/flashcard";
import { join } from "path";
import { readJsonWithSchema } from "./json";

//TODO: Do przeniesienia - kiedy ogarnę strukturę plików
export async function calculateElectronMastery(electronID: string, atomPath: string, collector){
    
    const electronsFlashcard = await readJsonWithSchema(
        join(atomPath, '__quiz__','flashcards.json'),
        FlashcardsFileSchema,
        collector 
    )
    if (!electronsFlashcard){
        return 0
    }

    let result = 0;
    for(const flashcard of electronsFlashcard){
        if (flashcard.electronId !== electronID) continue;
        const masterySum = flashcard.cards.reduce((acc,curr)=> acc + curr.mastery, 0);
        result = masterySum/flashcard.cards.length;
        
    }
    
    return result;
}