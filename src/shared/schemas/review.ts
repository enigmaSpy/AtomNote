import {z} from 'zod'

export const ReviewEventSchema = z.object({
  itemId: z.uuid(),
  itemType: z.enum(['flashcard', 'quiz']),
  timestamp: z.string(),
  outcome: z.enum(['correct', 'wrong', 'skipped']),
  selectedAnswerIndices: z.array(z.number().int()).optional()
})

export const ReviewsFileSchema = z.record(z.uuid(),ReviewEventSchema)
export type ReviewEvent = z.infer<typeof ReviewEventSchema>