import { GoogleGenAI, Type } from "@google/genai";
import { QnA } from "@/store/interview/types";
import { generateFallbackQuestions } from "../data/fallbackQuestions";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || "",
});
const GEMINI_MODEL = "gemini-2.5-flash";

const QNA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: {
      type: Type.STRING,
      description: "Unique ID for the question (e.g., q1, q2).",
    },
    question: {
      type: Type.STRING,
      description: "The full technical question.",
    },
    level: { type: Type.STRING, enum: ["EASY", "MEDIUM", "HARD"] },
    timeLimit: {
      type: Type.NUMBER,
      description: "Time limit in seconds (20, 60, or 120).",
    },
  },
  required: ["question", "level", "timeLimit"],
};

const QUESTION_BANK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "A list of 6 unique interview questions.",
      items: QNA_SCHEMA,
    },
  },
  required: ["questions"],
};

const SCORE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "The score for the answer, on a scale of 0 to 10.",
    },
    feedback: {
      type: Type.STRING,
      description: "A brief, constructive evaluation (1-2 sentences).",
    },
    isFinal: {
      type: Type.BOOLEAN,
      description: "True if this is the final question of the interview (Q6).",
    },
    finalSummary: {
      type: Type.STRING,
      description:
        "A concise 3-sentence summary of overall candidate performance. Only include this if isFinal is true.",
    },
    finalScore: {
      type: Type.NUMBER,
      description:
        "The total final score (0-60) for the candidate. Only include this if isFinal is true.",
    },
  },
  required: ["score", "feedback", "isFinal"],
};

export const generateQuestions = async (
  resumeRawText: string
): Promise<QnA[]> => {
  const prompt = `You are an expert technical interviewer specializing in Full Stack development (React and Node.js). 
        Your task is to generate 6 unique, non-trivial, open-ended interview questions: 2 EASY, 2 MEDIUM, and 2 HARD.
        Tailor the questions slightly based on the candidate's resume summary (provided below). Keep in mind that the questions should
        be like which are possible to answer in a text-based interview format and in the time limits specified.
        Ensure time limits are: EASY=20s, MEDIUM=60s, HARD=120s.

        Candidate Resume Summary: "${resumeRawText.slice(0, 500)}..."
        `;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUESTION_BANK_SCHEMA,
      },
    });

    const jsonText = response.text ? response.text.trim() : "";
    const result = JSON.parse(jsonText);

    if (result.questions && result.questions.length === 6) {
      return result.questions.map((q: QnA, index: number) => ({
        ...q,
        id: `q${index + 1}`,
      }));
    }

    throw new Error("AI returned incorrect structure or number of questions.");
  } catch (e) {
    console.error(
      "AI Question Generation Failed (Check API key/quota). Using Fallback JSON.",
      e
    );
    return generateFallbackQuestions();
  }
};

const PROFILE_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "The candidate's full name. Return null if not found.",
    },
    email: {
      type: Type.STRING,
      description: "The primary email address. Return null if not found.",
    },
    phone: {
      type: Type.STRING,
      description: "The best contact phone number. Return null if not found.",
    },
  },
  required: [],
};

export const fetchProfileDetails = async (
  resumeRawText: string
): Promise<{
  name: string | null;
  email: string | null;
  phone: string | null;
}> => {
  const prompt = `From the following raw resume text, extract the candidate's full name, primary email, and primary phone number. Only return a value if the detail appears relevant and professional. If a detail is missing or ambiguous, return null for that field.

Resume Text (first 1500 chars): "${resumeRawText.slice(0, 1500)}..."`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PROFILE_EXTRACTION_SCHEMA,
      },
    });

    const jsonText = response.text ? response.text.trim() : "";
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("AI Profile Extraction Failed. Returning nulls.", e);
    return { name: null, email: null, phone: null };
  }
};

export const fetchAIScoreAndNextQuestion = async (
  answer: string,
  isAutoSubmitted: boolean,
  currentQnA: QnA,
  resumeRawText: string,
  qnaHistory: QnA[]
): Promise<{
  score: number;
  feedback: string;
  nextQnA: QnA | null;
  isFinal: boolean;
  finalSummary?: string;
  finalScore?: number;
}> => {
  const isFinal = currentQnA.id === "q6";

  const historyContext = isFinal
    ? qnaHistory
        .map((q) => `Question ${q.id}: ${q.question}\nScore: ${q.score}/10\n`)
        .join("\n")
    : "";

  const prompt = `You are a scoring AI for a Full Stack Developer interview.
    - Difficulty: ${currentQnA.level} (Max Score: 10)
    - Question: ${currentQnA.question}
    - Candidate Answer: "${answer}"
    - Is this the final question of the interview? ${isFinal ? "YES" : "NO"}.

    TASK: Evaluate the answer for technical accuracy and depth.

    ${
      isFinal
        ? `FINAL TASK: Based on the following complete interview transcript, provide a holistic summary and final score (0-60).
        
        FULL INTERVIEW HISTORY (Q1-Q5 SCORED, Q6 ANSWERED):
        ${historyContext}
        Question 6: ${currentQnA.question}
        Answer 6: ${answer}

        Full Resume Text: ${resumeRawText.slice(0, 1500)}`
        : ""
    }
    `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SCORE_SCHEMA,
      },
    });

    const jsonText = response.text ? response.text.trim() : "";
    const aiResult = JSON.parse(jsonText);

    if (aiResult.score === undefined || aiResult.feedback === undefined) {
      throw new Error("AI returned an incomplete score object.");
    }

    return {
      score: aiResult.score,
      feedback: aiResult.feedback,
      nextQnA: null,
      isFinal,
      finalSummary:
        aiResult.finalSummary ||
        (isFinal ? "Summary generation failed." : undefined),
      finalScore: aiResult.finalScore || (isFinal ? 0 : undefined),
    };
  } catch (e) {
    console.error("Gemini Scoring Failed. Using mock fallback.", e);

    const score = isAutoSubmitted
      ? 0
      : Math.min(10, Math.floor(answer.length / 50) + 4);

    return {
      score,
      feedback:
        "API Failure: Could not connect to the scoring service. Score based on word count.",
      nextQnA: null,
      isFinal,
      finalSummary: isFinal
        ? "API connection failure. Final score based on raw data."
        : undefined,
      finalScore: isFinal ? 30 : undefined,
    };
  }
};
