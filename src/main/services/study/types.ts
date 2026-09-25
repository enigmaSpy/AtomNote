import type { Flashcard } from "@shared/schemas/flashcard"
import type { QuizQuestion } from "@shared/schemas/quiz"


export type StudyItems = 
    |Flashcard[]
    |QuizQuestion[]

export type StudyItem = 
    |Flashcard
    |QuizQuestion

export type Target = 
    |'flashcards.json' 
    | 'quizzes.json'

