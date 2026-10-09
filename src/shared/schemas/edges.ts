import z from "zod";
import { AtomIdSchema, ElectronIdSchema } from "./ids";

export const NodeRefSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('atom'),
        id: AtomIdSchema
    }),
    z.object({
        type: z.literal('electron'),
        id: ElectronIdSchema
    })
]);
export type NodeRef = z.infer<typeof NodeRefSchema>

export const EdgeSchema = z.object({
    from: NodeRefSchema,
    to: NodeRefSchema,

    layer: z.enum([
        'knowledge',
        'plot'
    ]),
    kind: z.enum([
        'bond',
        'entanglement',
        'reference'
    ])
});

export const EdgesSchema = z.array(EdgeSchema);
export type Edge = z.infer<typeof EdgeSchema>;