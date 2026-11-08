import {z} from 'zod'
import { ElectronIdSchema, QuizIdSchema } from './ids'

export const QuizQuestionSchema = z.object({
  id: QuizIdSchema,
  question: z.string(),
  answers: z.array(z.string()).min(2),
  correctAnswerIndex: z.array(z.number().int().min(0)).min(1),
  mastery: z.number().min(0).max(1).default(0)
})

export const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema)
})

export const QuizzesDictSchema = z.record(
  ElectronIdSchema,
  QuizSchema
)
export type QuizzesDict = z.infer<typeof QuizzesDictSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type Quiz = z.infer<typeof QuizSchema>