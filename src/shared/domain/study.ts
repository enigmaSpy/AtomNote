import type { AtomMeta } from "@shared/schemas/atom";
import type { Flashcard } from "@shared/schemas/flashcard";
import type { FlashcardId, QuizQuestionId } from "@shared/schemas/ids";
import type { QuizQuestion } from "@shared/schemas/quiz";
import type { DomainsDict } from "./types";

export type StudyType = 'flashcards' | 'quizzes';

export type FlashcardDraft = Omit<Flashcard, 'id' | 'mastery'>;
export type QuizQuestionDraft = Omit<QuizQuestion, 'id' | 'mastery'>;

export type ContentItem = FlashcardDraft | QuizQuestionDraft;
export type ContentItems = ContentItem[];

export type StudyItem = Flashcard | QuizQuestion;
export type StudyItems = StudyItem[];

export type FlashcardsDict = Record<FlashcardId, Flashcard>;
export type QuizzesDict = Record<QuizQuestionId, QuizQuestion>;
export type StudyItemsPacket = {
    lastStudiedAt: {
        flashcards: string|null,
        quizzes: string|null
    },
    flashcards: FlashcardsDict,
    quizzes: QuizzesDict
}

export type StudyItemEntry =
    | { kind: 'flashcards'; content: FlashcardDraft }
    | { kind: 'quizzes';    content: QuizQuestionDraft };

export type StudyItemEntryEdit=
    | { kind: 'flashcards'; content:  Partial<Omit<Flashcard, 'id'>>}
    | { kind: 'quizzes';    content: Partial<Omit<QuizQuestion, 'id'>>}


export type CreateAtomOutput = {
    atomMeta: AtomMeta
    domain: DomainsDict | null
}