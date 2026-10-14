import { z } from 'zod'
import { AtomIdSchema, ElectronIdSchema } from './ids'

export const ReferencedElectronSchema = z.record(AtomIdSchema, z.array(ElectronIdSchema));

export const AtomReferenceSchema = z.object({
    referencedAtoms: z.array(AtomIdSchema),
    referencedElectrons: ReferencedElectronSchema
});
//export const AtomReferenceWithParent = z.record(AtomIdSchema, AtomReferenceSchema);
export type AtomReference = z.infer<typeof AtomReferenceSchema>;

export const ElectronLinksSchema = z.object({
    referencedAtoms: z.array(AtomIdSchema),
    referencedElectrons: ReferencedElectronSchema
});
export const LinksIndexSchema = z.record(ElectronIdSchema, ElectronLinksSchema);
export type LinksIndex = z.infer<typeof LinksIndexSchema>;