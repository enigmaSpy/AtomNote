import {z} from 'zod';

export const AtomIdSchema = z.uuid().brand<'AtomId'>()
export const ElectronIdSchema = z.uuid().brand<'ElectronId'>()
export const DomainIdSchema = z.uuid().brand<'DomainIdSchema'>()

export type AtomId = z.infer<typeof AtomIdSchema>
export type ElectronId = z.infer<typeof ElectronIdSchema>
export type DomainId = z.infer<typeof DomainIdSchema>