import z from "zod";

export const AtomMetaSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([])
});
export type AtomMeta = z.infer<typeof AtomMetaSchema>