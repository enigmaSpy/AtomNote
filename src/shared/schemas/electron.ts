import {z} from 'zod'
import { ElectronIdSchema } from './ids';

const TagsSchema = z.codec(
    z.array(z.string()),
    z.set(z.string()),
    {
        decode: (arr) => new Set(arr),
        encode: (set) => [...set]
    }
);
export const ElectronMetaSchema = z.object({
    filename: z.string().min(1),
    tags: TagsSchema,
    mastery: z.number().min(0).max(1).default(0),
    createdAt: z.iso.datetime(),
    updatedAt:  z.iso.datetime()
});
export type ElectronMeta = z.infer<typeof ElectronMetaSchema>;

export const ElectronsDictSchema = z.record(
    ElectronIdSchema, 
    ElectronMetaSchema
);
export type ElectronsMetaDict = z.infer<typeof ElectronsDictSchema>;
