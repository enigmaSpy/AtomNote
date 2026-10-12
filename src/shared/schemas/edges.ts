import { z } from 'zod'
import { AtomIdSchema, ElectronIdSchema } from './ids'

export const AtomReferenceSchema = z.object({
    referencedAtoms: z.array(AtomIdSchema),
    referencedElectrons: z.record(AtomIdSchema, z.array(ElectronIdSchema))
});
//export const AtomReferenceWithParent = z.record(AtomIdSchema, AtomReferenceSchema);
export type AtomReference = z.infer<typeof AtomReferenceSchema>;

export const ElectronLinksSchema = z.object({
    referencedAtoms: z.array(AtomIdSchema),
    referencedElectrons: z.record(AtomIdSchema, z.array(ElectronIdSchema))
});
export const LinksIndexSchema = z.record(ElectronIdSchema, ElectronLinksSchema);
export type LinksIndex = z.infer<typeof LinksIndexSchema>;