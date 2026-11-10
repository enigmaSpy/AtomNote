import { readJsonWithSchema } from "@main/utils/json";
import type { StudyItemsPacket, StudyType } from "@shared/domain/study";
import type { Status } from "@shared/domain/types";
import { FlashcardsDiscSchema, type FlashcardDeck, type FlashcardsDisc } from "@shared/schemas/flashcard";
import { QuizzesDiscSchema, type QuizDeck, type QuizzesDisc } from "@shared/schemas/quiz";
import { join } from "path";


/**
 * Pobiera fiszki przypisane do konkretnego elektronu
 */
export async function fetchElectronStudyData(
    rootPath: string,
    atomName: string,
    electronId: string,
): Promise<Status<StudyItemsPacket>> {
    const atomPath = join(rootPath, atomName);

    const [flashcardsRes, quizzesRes] = await Promise.all([
        fetchFullStudyData(atomPath, 'flashcards'),
        fetchFullStudyData(atomPath, 'quizzes')
    ]);

    if (flashcardsRes.status === 'error') return flashcardsRes;
    if (quizzesRes.status === 'error') return quizzesRes;
    
    const electronFlashcards: FlashcardDeck= flashcardsRes.data[electronId];
    const electronQuizzes:QuizDeck = quizzesRes.data[electronId];
    

    return {
        status: 'ok',
        data: {
            lastStudiedAt: {
                flashcards: electronFlashcards?.lastStudiedAt ?? null,
                quizzes: electronQuizzes?.lastStudiedAt ?? null
            },
            flashcards: Object.fromEntries(
                (electronFlashcards?.items ?? []).map((item)=>[item.id, item])
            ),
            quizzes: Object.fromEntries(
                (electronQuizzes?.items ?? []).map((item)=>[item.id, item])
            )
        }
    };
}

export async function fetchFullStudyData<T extends StudyType>(
    atomPath: string, 
    target: T
):Promise<Status<T extends 'flashcards' ? FlashcardsDisc : QuizzesDisc>>
export async function fetchFullStudyData(atomPath: string, target: StudyType):Promise<Status<FlashcardsDisc|QuizzesDisc>> {
        const filename = `${target}.json`
        const filePath = join(atomPath, "__study__", filename);
        const isFlashcards = target === 'flashcards';
        const schema = isFlashcards ? FlashcardsDiscSchema : QuizzesDiscSchema;
        const readResult = await readJsonWithSchema<FlashcardsDisc|QuizzesDisc>(filePath, schema);
        if (readResult.status === 'invalid') {
            return {
                status: 'error',
                code: isFlashcards ? 'ERR_FLASHCARD_INVALID' : 'ERR_QUIZ_INVALID',
                details: `${readResult.status} - ${filePath}`
            }; 
        }else if(readResult.status === 'not-found'){
            return {status: 'ok', data:{}}; 
        }
        return {
            status: 'ok',
            data: readResult.data 
        };
    }