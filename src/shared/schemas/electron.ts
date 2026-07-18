import {z} from 'zod'

export const ElectronMetaSchema = z.object({
    id: z.string(),
    filename: z.string(),
    tags: z.array(z.string()).default([]),
    mastery: z.number().min(0).max(1).default(0),
    createdAt: z.string(),
    updatedAt: z.string()
});
export type ElectronMeta = z.infer<typeof ElectronMetaSchema>