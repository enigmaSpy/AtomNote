import { FlashcardsDictSchema} from "@shared/schemas/flashcard";
import { QuizzesDictSchema} from "@shared/schemas/quiz";
import { readJsonWithSchema } from "@shared/utils/json";
import type { StudyItems, Target } from "./types";
import { join } from "path";


/**
 * Pobiera fiszki przypisane do konkretnego elektronu
 */
export async function fetchElectronStudyMaterials(
    path: string,
    electronId: string,
) {
    const flashcards = await getStudyData(path, electronId, 'flashcards.json');
    const quizzes = await getStudyData(path, electronId, 'quizzes.json');
    
    return {flashcards,quizzes};
}
//TODO: normalizacja Tatget->StudyType
async function getStudyData(path: string,electronId:string, target:Target): Promise<StudyItems>{    

    const filePath = join(path, "__quiz__", target);
    if (target === 'flashcards.json') {
        const result = await readJsonWithSchema(filePath, FlashcardsDictSchema);
        console.log(filePath);
        
        if (result.status === 'invalid'){
            console.log("niepoprawny zod");
            console.log(filePath);
            return []
        };
        if (result.status==='not-found') {
            return []
        }
        return result.data![electronId]?.cards ?? [];
    }else if(target === 'quizzes.json'){
        const result = await readJsonWithSchema(filePath, QuizzesDictSchema);
        console.log(filePath);
        if (result.status === 'invalid'){
            console.log("niepoprawny zod");
            console.log(filePath);
            return []
        };
        if (result.status==='not-found') {
            return []
        }        
        return result.data![electronId]?.questions ?? [];
    }
    throw new Error("Invalid target, required 'flashcard.json' or 'quizzes.json'");
}

export async function getFullStudyData(path: string, target: Target) {
    const filePath = join(path, "__quiz__", target);
    
    if (target === 'flashcards.json') {
        const result = await readJsonWithSchema(filePath, FlashcardsDictSchema);
        if (result.status === 'invalid' || result.status === 'not-found') {
            return {}; 
        }
        return result.data;
        
    } else if (target === 'quizzes.json') {
        const result = await readJsonWithSchema(filePath, QuizzesDictSchema);
        if (result.status === 'invalid' || result.status === 'not-found') {
            return {}; 
        }
        return result.data;
    }
    
    throw new Error("Invalid target, required 'flashcards.json' or 'quizzes.json'");
}