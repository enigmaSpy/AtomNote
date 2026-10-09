import { z } from 'zod'
import { AtomTypeIdSchema, WorldlineIdSchema } from './ids'
export const AtomTypeSchema = z.object({
  id: AtomTypeIdSchema,
  name: z.string().min(1)
}) 



export const WorldlineMetaSchema = z.object({
  id: WorldlineIdSchema,
  description: z.string().default(''),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  domains: z.array(z.string()).default([]),
  atomTypes: z.array(AtomTypeSchema).default([]),
  settings: z.record(z.string(), z.unknown()).default({})
})
export type WorldlineMeta = z.infer<typeof WorldlineMetaSchema>