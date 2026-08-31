import { FlashcardsDictSchema, type Flashcard } from "@shared/schemas/flashcard";
import { QuizzesFileSchema, type QuizQuestion } from "@shared/schemas/quiz";
import { readJsonWithSchema } from "@shared/utils/json";
import { join } from "path";

/**
 * Pobiera fiszki przypisane do konkretnego elektronu
 */
export async function fetchElectronStudyMaterials(
    rootPath: string,
    atomName: string, 
    electronId: string,
) {

    const flashcards = await getStudyData(rootPath, atomName, electronId, 'flashcards.json');
    const quizzes = await getStudyData(rootPath, atomName, electronId, 'quizzes.json');
    

    
    return {flashcards,quizzes};
}

async function getStudyData(rootPath:string,atomName: string,electronId:string, source:string): Promise<Flashcard[]|QuizQuestion[]>{    

    const filePath = join(rootPath, atomName, "__quiz__", source);
    if (source === 'flashcards.json') {
        const result = await readJsonWithSchema(filePath, FlashcardsDictSchema);
        console.log(filePath);
        
        if (result.status === 'invalid'){
            console.log("niepoprawny zod");
            console.log(filePath);
            return []
        };
        if (result.status==='not-found') {
            console.log("nieznaleziono");
            console.log(filePath);
            return []
        }
        return result.data[electronId]?.cards ?? [];
    }else if(source === 'quizzes.json'){
        const result = await readJsonWithSchema(filePath, QuizzesFileSchema);
        console.log(filePath);
        if (result.status === 'invalid'){
            console.log("niepoprawny zod");
            console.log(filePath);
            return []
        };
        if (result.status==='not-found') {
            console.log("nieznaleziono");
            console.log(filePath);
            return []
        }        
        return result.data[electronId]?.questions ?? [];
    }
    throw new Error("Invalid source, required 'flashcard.json' or 'quizzes.json'");
    
}