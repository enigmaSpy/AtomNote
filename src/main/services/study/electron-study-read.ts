import { readJsonWithSchema } from "@main/utils/json";
import type { StudyItemsPacket, StudyType } from "@shared/domain/study";
import type { Status } from "@shared/domain/types";
import { FlashcardsDictSchema, type FlashcardsDict } from "@shared/schemas/flashcard";
import { QuizzesDictSchema, type QuizzesDict } from "@shared/schemas/quiz";
import { join } from "path";


/**
 * Pobiera fiszki przypisane do konkretnego elektronu
 */
export async function fetchElectronStudyMaterials(
    rootPath: string,
    atomName: string,
    electronId: string,
): Promise<Status<StudyItemsPacket>> {
    const atomPath = join(rootPath, atomName);

    const [flashcardsRes, quizzesRes] = await Promise.all([
        getFullStudyData(atomPath, 'flashcards'),
        getFullStudyData(atomPath, 'quizzes')
    ]);

    if (flashcardsRes.status === 'error') return flashcardsRes;
    if (quizzesRes.status === 'error') return quizzesRes;
    
    return {
        status: 'ok',
        data: {
            flashcards: flashcardsRes.data[electronId]?.cards ?? [],
            quizzes: quizzesRes.data[electronId]?.questions ?? []
        }
    };
}

export async function getFullStudyData<T extends StudyType>(
    atomPath: string, 
    target: T
):Promise<Status<T extends 'flashcards' ? FlashcardsDict : QuizzesDict>>
export async function getFullStudyData(atomPath: string, target: StudyType):Promise<Status<FlashcardsDict|QuizzesDict>> {
        const filename = `${target}.json`
        const filePath = join(atomPath, "__study__", filename);
        const schema = target === 'flashcards' ? FlashcardsDictSchema : QuizzesDictSchema;
        const result = await readJsonWithSchema<FlashcardsDict|QuizzesDict>(filePath, schema);
        if (result.status === 'invalid') {
            return {
                status:'error', 
                code: 'ERR_FLASHCARD_INVALID', 
                details: `${filePath} - cannot read file`
            }; 
        }else if(result.status === 'not-found'){
            return {status: 'ok', data:{}}; 
        }
        if(target==='flashcards'){
            return {
                status: 'ok',
                data: result.data as FlashcardsDict
            };
        }
        return {
            status: 'ok',
            data: result.data as QuizzesDict
        };
    }