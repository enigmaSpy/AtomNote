import {z} from 'zod';

export const AtomIdSchema = z.uuid().brand<'AtomId'>()
export const ElectronIdSchema = z.uuid().brand<'ElectronId'>()
export const WorldlineIdSchema = z.string().brand<'WorldlineId'>()
export const AtomTypeIdSchema = z.uuid().brand<'AtomTypeId'>()

export type AtomId = z.infer<typeof AtomIdSchema>
export type ElectronId = z.infer<typeof ElectronIdSchema>
export type WorldlineId = z.infer<typeof WorldlineIdSchema>
export type AtomTypeId = z.infer<typeof AtomTypeIdSchema>