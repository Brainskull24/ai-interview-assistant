export interface Profile {
  name: string;
  email: string;
  phone: string;
  resumeRawText: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "ai" | "candidate" | "system";
  timestamp: string; 
}

export interface QnA {
  id: string;
  question: string;
  level: "EASY" | "MEDIUM" | "HARD";
  timeLimit: number;
  answer: string | null;
  score: number | null;
  timeTaken: number | null;
}

export interface Candidate {
  id: string;
  profile: Profile;
  isProfileComplete: boolean;
  status: "IDLE" | "PROMPTING" | "IN_PROGRESS" | "PAUSED" | "COMPLETED";

  currentQnAIndex: number;
  timerRemaining: number;
  isTimerRunning: boolean;
  questionBank: QnA[];

  finalScore: number | null;
  finalSummary: string | null;

  qnaHistory: QnA[];
  chatHistory: ChatMessage[];
}

export interface InterviewState {
  candidates: Candidate[];
  activeCandidate: Candidate | null;
}
