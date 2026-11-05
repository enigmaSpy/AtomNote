import type { Flashcard } from "@shared/schemas/flashcard";
import type { QuizQuestion } from "@shared/schemas/quiz";

export type StudyType = 'flashcards' | 'quizzes';

export type FlashcardDraft = Omit<Flashcard, 'id' | 'mastery'>;
export type QuizQuestionDraft = Omit<QuizQuestion, 'id' | 'mastery'>;

export type ContentItem = FlashcardDraft | QuizQuestionDraft;
export type ContentItems = ContentItem[];

export type StudyItem = Flashcard | QuizQuestion;
export type StudyItems = StudyItem[];
export type StudyItemsPacket = {
    flashcards: Flashcard[],
    quizzes: QuizQuestion[]
}

export type StudyItemEntry =
    | { kind: 'flashcards'; content: FlashcardDraft }
    | { kind: 'quizzes';    content: QuizQuestionDraft };

export type StudyItemEntryEdit=
    | { kind: 'flashcards'; content:  Partial<Omit<Flashcard, 'id'>>}
    | { kind: 'quizzes';    content: Partial<Omit<QuizQuestion, 'id'>>};
