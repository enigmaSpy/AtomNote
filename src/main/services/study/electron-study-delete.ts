import { writeJsonWithSchema } from "@main/utils/json";
import type { Status } from "@shared/domain/types";
import { FlashcardsDiscSchema, type FlashcardsDisc } from "@shared/schemas/flashcard";
import type { ElectronId, FlashcardId, QuizId } from "@shared/schemas/ids";
import { QuizzesDiscSchema, type QuizzesDisc } from "@shared/schemas/quiz";
import { join } from "path";
import { fetchFullStudyData } from "./electron-study-read";
import type { StudyType } from "@shared/domain/study";


export async function deleteElectronStudy(rootPath: string, atomName: string, electronId:ElectronId, targetId: FlashcardId | QuizId, target: StudyType):Promise<Status>{
    const atomPath = join(rootPath, atomName)
    const fileName = target === 'flashcards' ? 'flashcards.json' : 'quizzes.json';
    const dataDict = await fetchFullStudyData(atomPath, target);
    if(dataDict.status === 'error'){
        return dataDict;
    }
    const filePath = join(atomPath, '__study__', fileName);
    const isFlashcards = target === 'flashcards'
    const schema = isFlashcards? FlashcardsDiscSchema:QuizzesDiscSchema;
    const studyDict = dataDict.data[electronId];
    if(!studyDict) return {status:'ok'};

    const itemIndex = studyDict.items.findIndex(({id})=>id===targetId);
    if (itemIndex === -1) return { status: 'ok' };
    studyDict.items.splice(itemIndex, 1);

    const writeResult = await writeJsonWithSchema<FlashcardsDisc| QuizzesDisc>(filePath, schema, dataDict.data);
    if(writeResult.status === 'write-failed'){
            return {
                status: 'error',
                code: 'ERR_ELECTRON_WRITE_FAILED',
                details:`${filePath} - write failed`
            }
        }else if(writeResult.status === 'invalid'){
            return {
                status: 'error',
                code: 'ERR_ELECTRON_INVALID',
                details:`${filePath} - invalid schema`}
        }
    return {status: 'ok'}
}