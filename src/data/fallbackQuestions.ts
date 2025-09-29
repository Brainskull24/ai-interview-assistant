import { QnA } from "@/store/interview/types";

interface QuestionPool {
  EASY: Omit<QnA, "id" | "answer" | "score" | "timeTaken">[];
  MEDIUM: Omit<QnA, "id" | "answer" | "score" | "timeTaken">[];
  HARD: Omit<QnA, "id" | "answer" | "score" | "timeTaken">[];
}

const BASE_QUESTIONS: QuestionPool = {
  EASY: [
    {
      question: "Name three commonly used React hooks and their basic purpose.",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question: "What is the Virtual DOM in React in one or two lines?",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question:
        "How do you update a controlled input value in React using state?",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question:
        "What is prop drilling, and which React feature helps avoid it?",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question:
        "Differentiate between `export` and `export default` in JavaScript briefly.",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question: "List four common HTTP methods used in REST APIs.",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question: "What does the `useEffect` hook mainly do?",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question:
        "How can you update an object in React state without mutating it?",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question: "Why are `keys` important when rendering lists in React?",
      level: "EASY",
      timeLimit: 20,
    },
    {
      question: "In Express.js, what is middleware in one line?",
      level: "EASY",
      timeLimit: 20,
    },
  ],
  MEDIUM: [
    {
      question: "Explain how the Node.js event loop allows non-blocking I/O.",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question:
        "How would you add authentication middleware in an Express.js route?",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question:
        "When should you use `useContext` vs `useReducer` vs Redux for state management?",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question:
        "What is memoization in React, and when would you use `useMemo` vs `useCallback`?",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question:
        "Give two differences between SQL and NoSQL and a use case for each.",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question:
        "What is Server-Side Rendering (SSR), and one advantage + one drawback?",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question: "How does async/await make working with Promises easier?",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question: "What is CORS, and how do you enable it in Express.js?",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question: "Describe the typical data flow in a Redux app.",
      level: "MEDIUM",
      timeLimit: 60,
    },
    {
      question:
        "What HTTP methods and response codes would you use to manage a user profile API?",
      level: "MEDIUM",
      timeLimit: 60,
    },
  ],
  HARD: [
    {
      question:
        "How would you implement JWT-based authentication in Express (steps only)?",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "How would you containerize a React + Express app using Docker?",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "What steps/tools would you use to identify and fix a slow React app?",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "What is microservices architecture, and one main challenge when migrating from monolith?",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "Design a basic schema for a chat app with private + group messages (SQL or NoSQL).",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "What are race conditions and deadlocks, and how does Node.js’s single-thread model affect them?",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "Name two best practices to prevent XSS and two for SQL injection.",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "How would you use a state machine to handle a multi-step checkout form?",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "Compare Node’s Cluster module vs Nginx reverse proxy for scaling.",
      level: "HARD",
      timeLimit: 120,
    },
    {
      question:
        "How do you securely handle file uploads in Express (validation + storage)?",
      level: "HARD",
      timeLimit: 120,
    },
  ],
};

export const generateFallbackQuestions = (): QnA[] => {
  const result: QnA[] = [];
  let questionIdCounter = 1;

  (["EASY", "MEDIUM", "HARD"] as const).forEach((level) => {
    const pool = BASE_QUESTIONS[level];

    const shuffled = [...pool].sort(() => 0.5 - Math.random());

    shuffled.slice(0, 2).forEach((q) => {
      result.push({
        ...q,
        id: `q${questionIdCounter++}`,
        answer: null,
        score: null,
        timeTaken: null,
      });
    });
  });

  return result;
};
