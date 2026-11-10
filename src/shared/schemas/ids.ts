import {z} from 'zod';

export const AtomIdSchema = z.uuid().brand<'AtomId'>()
export const ElectronIdSchema = z.uuid().brand<'ElectronId'>()
export const DomainIdSchema = z.uuid().brand<'DomainId'>()

export const FlashcardIdSchema = z.uuid().brand<'FlashcardId'>()
export const QuizQuestionIdSchema = z.uuid().brand<'QuizId'>()

export type AtomId = z.infer<typeof AtomIdSchema>
export type ElectronId = z.infer<typeof ElectronIdSchema>
export type DomainId = z.infer<typeof DomainIdSchema>

export type FlashcardId = z.infer<typeof FlashcardIdSchema>
export type QuizQuestionId = z.infer<typeof QuizQuestionIdSchema>
