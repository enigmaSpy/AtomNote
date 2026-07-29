import z from "zod";

export const FlashcardSchema = z.object({
  id: z.uuid(),
  front: z.string(),
  back: z.string(),
  mastery: z.number().min(0).max(1).default(0)
})

export const FlashcardSetSchema = z.object({
  id: z.uuid(),
  cards: z.array(FlashcardSchema)
})

export const FlashcardsDictSchema = z.record(z.uuid(),FlashcardSetSchema)
export type FlashcardsDict = z.infer<typeof FlashcardsDictSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>
export type FlashcardSet = z.infer<typeof FlashcardSetSchema>