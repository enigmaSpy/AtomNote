import z from "zod";

export const FlashCardSchema = z.object({
    id: z.string(),
    electron_id: z.string(),
    front: z.string(),
    back: z.string(),
    mastery: z.string()
});
export type FlashCard = z.infer<typeof FlashCardSchema>