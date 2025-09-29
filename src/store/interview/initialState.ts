import { Candidate } from "./types";

export const initialCandidate: Candidate = {
  id: "",
  profile: {
    name: "",
    email: "",
    phone: "",
    resumeRawText: "",
  },
  isProfileComplete: false,
  questionBank: [],
  status: "IDLE",
  currentQnAIndex: 0,
  timerRemaining: 0,
  isTimerRunning: false,
  finalScore: null,
  finalSummary: null,
  qnaHistory: [],
  chatHistory: [],
};
