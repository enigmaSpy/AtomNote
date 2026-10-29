import { z } from 'zod'
import { DomainIdSchema } from './ids'


export const WorldlineMetaSchema = z.object({
  domains: z.record(DomainIdSchema, z.object({ name: z.string() })).default({}),

  settings: z
        .record(z.string(), z.unknown())
        .default({})
})
export type WorldlineMeta = z.infer<typeof WorldlineMetaSchema>