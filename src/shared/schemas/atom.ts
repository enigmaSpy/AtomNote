import z from "zod";
import { AtomIdSchema, DomainIdSchema } from "./ids";

export const AtomMetaSchema = z.object({
    id: AtomIdSchema,
    description: z.string().default(''),
    domainId: DomainIdSchema.nullable().default(null),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime()
});
export type AtomMeta = z.infer<typeof AtomMetaSchema>

