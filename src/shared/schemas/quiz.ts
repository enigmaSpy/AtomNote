import {z} from 'zod'
import { ElectronIdSchema, QuizQuestionIdSchema } from './ids'

export const QuizQuestionSchema = z.object({
  id: QuizQuestionIdSchema,
  question: z.string(),
  answers: z.array(z.string()).min(2),
  correctAnswerIndex: z.array(z.number().int().min(0)).min(1),
  mastery: z.number().min(0).max(1).default(0)
})

export const QuizDeckSchema = z.object({
  lastStudiedAt: z.string().nullable().default(null),
  items: z.array(QuizQuestionSchema)
})

export const QuizzesDiscSchema = z.record(
  ElectronIdSchema,
  QuizDeckSchema
)
export type QuizzesDisc = z.infer<typeof QuizzesDiscSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type QuizDeck = z.infer<typeof QuizDeckSchema>