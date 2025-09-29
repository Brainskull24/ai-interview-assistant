import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Candidate, InterviewState, Profile, QnA, ChatMessage } from "./types";
import { initialCandidate } from "./initialState";

const initialState: InterviewState = {
  candidates: [],
  activeCandidate: null,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    startNewSession: (state) => {
      const newCandidate: Candidate = {
        ...initialCandidate,
        id: Date.now().toString(),
        status: "PROMPTING",
      };
      state.activeCandidate = newCandidate;
    },

    loadSession: (state, action: PayloadAction<Candidate>) => {
      state.activeCandidate = action.payload;
    },

    clearActiveSession: (state) => {
      state.activeCandidate = null;
    },

    updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.profile = {
        ...state.activeCandidate.profile,
        ...action.payload,
      };
    },

    setProfileComplete: (state, action: PayloadAction<boolean>) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.isProfileComplete = action.payload;
    },

    startInterview: (state, action: PayloadAction<{ firstQuestion: QnA }>) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.qnaHistory = [action.payload.firstQuestion];
      state.activeCandidate.status = "IN_PROGRESS";
    },

    moveToNextQuestion: (
      state,
      action: PayloadAction<{ nextQuestion: QnA }>
    ) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.qnaHistory.push(action.payload.nextQuestion);
      state.activeCandidate.currentQnAIndex += 1;
    },

    saveAnswerAndScore: (
      state,
      action: PayloadAction<{
        answer: string;
        score: number;
        timeTaken: number;
      }>
    ) => {
      if (!state.activeCandidate) return;
      const currentQnA =
        state.activeCandidate.qnaHistory[state.activeCandidate.currentQnAIndex];
      if (currentQnA) {
        currentQnA.answer = action.payload.answer;
        currentQnA.score = action.payload.score;
        currentQnA.timeTaken = action.payload.timeTaken;
      }
    },

    setQuestionBank: (state, action: PayloadAction<QnA[]>) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.questionBank = action.payload;
    },

    setTimer: (state, action: PayloadAction<number>) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.timerRemaining = action.payload;
    },

    setTimerRunning: (state, action: PayloadAction<boolean>) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.isTimerRunning = action.payload;
    },

    decrementTimer: (state) => {
      if (!state.activeCandidate || !state.activeCandidate.isTimerRunning)
        return;
      state.activeCandidate.timerRemaining = Math.max(
        0,
        state.activeCandidate.timerRemaining - 1
      );
    },

    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (!state.activeCandidate) return;
      state.activeCandidate.chatHistory.push(action.payload);
    },

    completeInterview: (
      state,
      action: PayloadAction<{ finalScore: number; finalSummary: string }>
    ) => {
      if (!state.activeCandidate) return;

      state.activeCandidate.status = "COMPLETED";
      state.activeCandidate.finalScore = action.payload.finalScore;
      state.activeCandidate.finalSummary = action.payload.finalSummary;
      state.activeCandidate.isTimerRunning = false;
      state.candidates.unshift(state.activeCandidate);
    },
  },
});

export const {
  startNewSession,
  loadSession,
  clearActiveSession,
  updateProfile,
  setProfileComplete,
  startInterview,
  moveToNextQuestion,
  saveAnswerAndScore,
  setTimer,
  setTimerRunning,
  decrementTimer,
  addChatMessage,
  completeInterview,
  setQuestionBank,
} = interviewSlice.actions;

export default interviewSlice.reducer;
