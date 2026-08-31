import { readJsonWithSchema, writeJson } from "@shared/utils/json";
import { join } from "node:path";
import { fetchElectronStudyMaterials } from "./electron-study-read";
import { FlashcardsDictSchema } from "@shared/schemas/flashcard";

export async function addElectronStudyData(
    rootPath: string,
    atomPath: string,
    electronId: string,
    content: string,
    target: 'flashcard'|'quiz'
):Promise<void>{
    const {flashcards, quizzes} = await fetchElectronStudyMaterials(rootPath,atomPath, electronId);
    if (target === 'flashcard') {
        if (flashcards.length <= 0){
            const flashcardsPath = join(rootPath, atomPath, '__quiz__', 'flashcards.json');
            await writeJson(flashcardsPath, content);
            return;
        }else{
            
        }
    }else if(target === 'quiz'){
        if (quizzes.length <= 0){
            const quizzesPath = join(rootPath, atomPath, '__quiz__', 'quizzes.json');
            await writeJson(quizzesPath, content);
            return;
        }
    }else{
        throw new Error("Invalid soirce in 'addElectronStudyData")
    }
}