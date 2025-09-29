import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import {
  saveAnswerAndScore,
  moveToNextQuestion,
  completeInterview,
  addChatMessage,
  setTimerRunning,
  setTimer,
} from "./interview/interviewSlice";
import { fetchAIScoreAndNextQuestion } from "@/services/aiService";

export const submitAnswerThunk = createAsyncThunk(
  "interview/submitAnswer",
  async (
    { answer, isAutoSubmitted }: { answer: string; isAutoSubmitted: boolean },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const activeCandidate = state.interview.activeCandidate;

    if (!activeCandidate || activeCandidate.status !== "IN_PROGRESS") {
      return;
    }

    const currentQnA =
      activeCandidate.qnaHistory[activeCandidate.currentQnAIndex];
    const timeLimit = currentQnA.timeLimit;
    const timeTaken = timeLimit - activeCandidate.timerRemaining;

    dispatch(setTimerRunning(false));

    if (isAutoSubmitted) {
      dispatch(
        addChatMessage({
          id: Date.now().toString(),
          text: "Time's up! Auto-submitting the answer...",
          sender: "system",
          timestamp: new Date().toISOString(),
        })
      );
    }

    const aiResult = await fetchAIScoreAndNextQuestion(
      answer,
      isAutoSubmitted,
      currentQnA,
      activeCandidate.profile.resumeRawText,
      activeCandidate.qnaHistory
    );

    dispatch(
      saveAnswerAndScore({
        answer: answer,
        score: aiResult.score,
        timeTaken: timeTaken,
      })
    );

    const now = Date.now();
    dispatch(
      addChatMessage({
        id: (now + 1).toString(),
        text: `AI Judge: ${aiResult.feedback}`,
        sender: "ai",
        timestamp: new Date().toISOString(),
      })
    );

    const currentQIndex = activeCandidate.currentQnAIndex;
    const isFinal = currentQIndex === 5;

    if (isFinal) {
      const updatedState = getState() as RootState;
      const completedCandidate = updatedState.interview.activeCandidate;

      const calculatedFinalScore = completedCandidate!.qnaHistory.reduce(
        (sum, qna) => sum + (qna.score || 0),
        0
      );

      const finalMessageId = (now + 2).toString();
      dispatch(
        addChatMessage({
          id: finalMessageId,
          text: `**Interview Complete!** Your final score is ${aiResult.finalScore}/60. Please review the dashboard.`,
          sender: "system",
          timestamp: new Date().toISOString(),
        })
      );

      dispatch(
        completeInterview({
          finalScore: calculatedFinalScore,
          finalSummary: aiResult.finalSummary || "Analysis complete.",
        })
      );
    } else {
      const nextQnAIndex = currentQIndex + 1;
      const nextQnA = activeCandidate.questionBank[nextQnAIndex];

      if (nextQnA) {
        dispatch(moveToNextQuestion({ nextQuestion: nextQnA }));
        dispatch(setTimer(nextQnA.timeLimit));
        dispatch(setTimerRunning(true));
        dispatch(
          addChatMessage({
            id: (now + 2).toString(),
            text: `[${nextQnA.level} Q${nextQnAIndex + 1}] ${nextQnA.question}`,
            sender: "ai",
            timestamp: new Date().toISOString(),
          })
        );
      }
    }
  }
);
