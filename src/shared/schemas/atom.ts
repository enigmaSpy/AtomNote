import z from "zod";
import { AtomIdSchema, AtomTypeIdSchema } from "./ids";

export const AtomMetaSchema = z.object({
    id: AtomIdSchema,
    description: z.string().default(''),
    domain: z.string(),
    typeId: AtomTypeIdSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
});
export type AtomMeta = z.infer<typeof AtomMetaSchema>