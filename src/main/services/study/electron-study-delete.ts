import { writeJsonWithSchema } from "@main/utils/json";
import type { Status } from "@shared/domain/types";
import { FlashcardsDictSchema } from "@shared/schemas/flashcard";
import type { FlashcardId, QuizId } from "@shared/schemas/ids";
import { QuizzesDictSchema, } from "@shared/schemas/quiz";
import { join } from "path";
import { getFullStudyData } from "./electron-study-read";
import type { StudyType } from "@shared/domain/study";


export async function deleteElectronStudy(rootPath: string, atomName: string, electronId:string, targetId: FlashcardId | QuizId, target: StudyType):Promise<Status>{
    const atomPath = join(rootPath, atomName)
    const fileName = target === 'flashcards' ? 'flashcards.json' : 'quizzes.json';
    const dataDict = await getFullStudyData(atomPath, target);
    if(dataDict.status === 'error'){
        return dataDict;
    }
    const filePath = join(atomPath, '__study__', fileName);
    if(target === 'flashcards'){
        const flashcardsDict = dataDict.data;
        if (!flashcardsDict[electronId]) return {status: 'ok'};
        flashcardsDict[electronId].cards = flashcardsDict[electronId].cards.filter(({id})=>id!==targetId);
        
        
        const writeResult = await writeJsonWithSchema(filePath, FlashcardsDictSchema, flashcardsDict);
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
    }else if(target === 'quizzes'){
        const quizzesDict = dataDict.data;
        if (!quizzesDict[electronId]) return {status: 'ok'};
        quizzesDict[electronId].questions = quizzesDict[electronId].questions.filter(({id})=>id!==targetId);
        
        const writeResult = await writeJsonWithSchema(filePath, QuizzesDictSchema, quizzesDict);
        if(writeResult.status === 'write-failed'){
            return {
                status: 'error'
                ,code: 'ERR_ELECTRON_WRITE_FAILED',
                details:`${filePath} - write failed`}
        }else if(writeResult.status === 'invalid'){
            return {status: 'error',
                code: 'ERR_ELECTRON_INVALID' ,
                details:`${filePath} - invalid schema`}
        }
    }
    return {status: 'ok'}
}