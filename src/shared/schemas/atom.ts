import z from "zod";

export const AtomMetaSchema = z.object({
    id: z.uuid(),
    name: z.string().optional(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    createdAt: z.string()
});
export type AtomMeta = z.infer<typeof AtomMetaSchema>