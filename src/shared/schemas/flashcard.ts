import z from "zod";
import { ElectronIdSchema, FlashcardIdSchema } from "./ids";

export const FlashcardSchema = z.object({
  id: FlashcardIdSchema,
  front: z.string(),
  back: z.string(),
  mastery: z.number().min(0).max(1).default(0)
})

export const FlashcardDeckSchema = z.object({
  lastStudiedAt: z.string().nullable().default(null),
  items: z.array(FlashcardSchema)
})

export const FlashcardsDiscSchema = z.record(
  ElectronIdSchema,
  FlashcardDeckSchema
)
export type FlashcardsDisc = z.infer<typeof FlashcardsDiscSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>
export type FlashcardDeck = z.infer<typeof FlashcardDeckSchema>