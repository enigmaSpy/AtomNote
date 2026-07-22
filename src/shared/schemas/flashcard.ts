import z from "zod";

export const FlashcardSchema = z.object({
  id: z.uuid(),
  front: z.string(),
  back: z.string(),
  mastery: z.number().min(0).max(1).default(0)
})

export const FlashcardSetSchema = z.object({
  id: z.uuid(),
  electronId: z.uuid(),
  cards: z.array(FlashcardSchema)
})

export const FlashcardsFileSchema = z.array(FlashcardSetSchema)
export type Flashcard = z.infer<typeof FlashcardSchema>
export type FlashcardSet = z.infer<typeof FlashcardSetSchema>