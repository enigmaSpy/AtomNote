import { z } from 'zod'
import { DomainIdSchema } from './ids'


export const WorldlineMetaSchema = z.object({
  domains: z.array(DomainIdSchema).default([]),

  settings: z
        .record(z.string(), z.unknown())
        .default({})
})
export type WorldlineMeta = z.infer<typeof WorldlineMetaSchema>