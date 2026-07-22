import {z} from 'zod'

export const QuizQuestionSchema = z.object({
  id: z.uuid(),
  question: z.string(),
  answers: z.array(z.string()).min(2),
  correctAnswerIndex: z.array(z.number().int().min(0)).min(1),
  mastery: z.number().min(0).max(1).default(0)
})

export const QuizSchema = z.object({
  id: z.uuid(),
  electronId: z.uuid(),
  questions: z.array(QuizQuestionSchema)
})

export const QuizzesFileSchema = z.array(QuizSchema)
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type Quiz = z.infer<typeof QuizSchema>