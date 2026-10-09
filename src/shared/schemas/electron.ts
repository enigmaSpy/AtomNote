import {z} from 'zod'
import { ElectronIdSchema } from './ids';

export const ElectronMetaSchema = z.object({
    filename: z.string().min(1),
    tags: z.array(z.string()).default([]),
    mastery: z.number().min(0).max(1).default(0),
    createdAt: z.iso.datetime(),
    updatedAt:  z.iso.datetime()
});
export const ElectronsDictSchema = z.record(
    ElectronIdSchema, 
    ElectronMetaSchema
);
export type ElectronsDict = z.infer<typeof ElectronsDictSchema>
export type ElectronMeta = z.infer<typeof ElectronMetaSchema>