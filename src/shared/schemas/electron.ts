import {z} from 'zod'

export const ElectronMetaSchema = z.object({
    id: z.uuid(),
    tags: z.array(z.string()).default([]),
    covalentAtomIds: z.array(z.uuid()).default([]),
    createdAt: z.string(),
    updatedAt: z.string()
});
export const ElectronsDictSchema = z.record(z.string(), ElectronMetaSchema)
export type ElectronsDict = z.infer<typeof ElectronsDictSchema>