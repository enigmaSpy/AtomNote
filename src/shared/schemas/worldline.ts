import { z } from 'zod'

export const DomainSchema = z.object({
  id: z.string(),
  name: z.string(),
  tags: z.array(z.string()).default([])
})

export const EdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  layer: z.enum(['knowledge', 'plot']),
  kind: z.enum(['bond', 'entanglement'])
})

export const WorldlineMetaSchema = z.object({
  description: z.string().default(''),
  createdAt: z.string(),
  domains: z.array(DomainSchema).default([]),
  edges: z.array(EdgeSchema).default([]),
  settings: z.record(z.string(), z.unknown()).default({})
})
export type WorldlineMeta = z.infer<typeof WorldlineMetaSchema>