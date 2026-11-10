import { writeJsonWithSchema } from "@main/utils/json";
import { fetchFullStudyData } from "./electron-study-read";
import { FlashcardsDiscSchema, type Flashcard, type FlashcardsDisc } from "@shared/schemas/flashcard";
import { join } from "path";
import { QuizzesDiscSchema, type QuizQuestion, type QuizzesDisc  } from "@shared/schemas/quiz";
import type { Status } from "@shared/domain/types";
import { randomUUID } from "crypto";
import type { FlashcardId, QuizQuestionId } from "@shared/schemas/ids";
import type { StudyItemEntry } from "@shared/domain/study";

export async function addElectronStudyData(rootPath: string, atomName: string, electronId:string, payload:StudyItemEntry):Promise<Status<Flashcard|QuizQuestion>>{
    const fileName = payload.kind==='flashcards'? 'flashcards.json' : 'quizzes.json';
    const atomPath = join(rootPath, atomName)

    const studyResult = await fetchFullStudyData(atomPath, payload.kind);
    if(studyResult.status === 'error') return studyResult;

    const atomStudyPath = join(atomPath, '__study__', fileName);
    const newId = randomUUID();
    
    const studyData = studyResult.data
    let contentToAdd:Flashcard|QuizQuestion;
    if(payload.kind === 'flashcards'){
        contentToAdd = {
            id: newId as FlashcardId,
            mastery: 0,
            ...payload.content
        };
    }else{
        contentToAdd = {
            id: newId as QuizQuestionId,
            mastery: 0,
            ...payload.content
        }
    }
    studyData[electronId] ??= { lastStudiedAt: null, items: [] };;
    studyData[electronId].items.push(contentToAdd);

    const isFlashcards = payload.kind === 'flashcards';
    const schema = isFlashcards ? FlashcardsDiscSchema : QuizzesDiscSchema;

    const savingResult = await writeJsonWithSchema<FlashcardsDisc | QuizzesDisc>(
        atomStudyPath,
        schema,
        studyData
    );

    if (savingResult.status === 'invalid') {
        return {
            status: 'error',
            code: isFlashcards ? 'ERR_FLASHCARD_INVALID' : 'ERR_QUIZ_INVALID',
            details: `${savingResult.status} - ${atomStudyPath}`
        };
    }

    if (savingResult.status === 'write-failed') {
        return {
            status: 'error',
            code: isFlashcards ? 'ERR_FLASHCARD_WRITE_FAILED' : 'ERR_QUIZ_WRITE_FAILED',
            details: `${savingResult.status} - ${atomStudyPath}`
        };
    }

    return {
        status: 'ok',
        data: contentToAdd
    };
}