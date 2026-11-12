import type { StudyType } from "@shared/domain/study";
import type { ElectronId, FlashcardId, QuizQuestionId } from "@shared/schemas/ids";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface SessionTrack<TId>{
    queue: TId[];
    initialCount: number;
    round: number;
    remainingInRound: number;
}

export interface ElectronSession{
    flashcards: SessionTrack<FlashcardId>;
    quizzes: SessionTrack<QuizQuestionId>;
}

export type StartSessionPayload =
    | { type: "flashcards"; ids: FlashcardId[] }
    | { type: "quizzes"; ids: QuizQuestionId[] };

export interface StudySessionActions{
    startSession: (electronId: ElectronId, payload: StartSessionPayload)=>void;
    nextItem: ( electronId: ElectronId, target: StudyType, isKnown: boolean) => void;
    resetSession: (electronId: ElectronId, target: StudyType) => void;
}
export interface StudySessionStore{
    sessions: Record<ElectronId, ElectronSession>,
    actions: StudySessionActions
}
const createEmptySession = (): ElectronSession => ({
    flashcards: { queue: [], initialCount: 0, round: 0, remainingInRound: 0 },
    quizzes: { queue: [], initialCount: 0, round: 0, remainingInRound: 0 },
});
export const useStudySessionStore = create<StudySessionStore>()(immer((set) => ({
    sessions: {},
    actions: {
        startSession: (electronId, payload) =>
            set((state) => {
                const session = (state.sessions[electronId] ??= createEmptySession());
                    if (payload.type === "flashcards") {
                        session.flashcards = {
                            queue: [...payload.ids],
                            initialCount: payload.ids.length,
                            round: 1, 
                            remainingInRound: payload.ids.length
                        };
                    } else {
                        session.quizzes = {
                            queue: [...payload.ids],
                            initialCount: payload.ids.length,
                            round: 1, 
                            remainingInRound: payload.ids.length
                        };
                    }
                }),

        nextItem: (electronId, target, isKnown) =>
            set((state) => {
                const session = state.sessions[electronId]?.[target];
                if(!session) return;
                const queue = session.queue;
                const currentId = queue?.shift();
                if(!currentId) return;
                if (!isKnown) {
                    (queue as string[]).push(currentId);
                }
                session.remainingInRound -= 1;
                if (session.remainingInRound === 0 && queue.length > 0) {
                    session.round += 1;
                    session.remainingInRound = queue.length;
                }
            }),
        resetSession: (electronId, target) =>
            set((state) => {
                const session = state.sessions[electronId]?.[target];
                if(!session) return;
                session.queue = [];
                session.initialCount = 0;
            }),
        },
    }))
);

export const useStudySessionActions =()=> useStudySessionStore(state=>state.actions);