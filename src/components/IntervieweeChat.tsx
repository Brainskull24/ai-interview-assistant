// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState, AppDispatch } from "@/store/store";
// import {
//   addChatMessage,
//   setTimerRunning,
//   startInterview,
//   setTimer,
//   decrementTimer,
//   setQuestionBank,
//   clearActiveSession,
// } from "@/store/interview/interviewSlice";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ChatMessage } from "@/store/interview/types";
// import { generateFallbackQuestions } from "@/data/fallbackQuestions";
// import { Loader2, Zap, Clock, Send, Pause, CheckCircle } from "lucide-react";
// import { submitAnswerThunk } from "@/store/interviewThunk";
// import { ProfileConfirmationForm } from "./ProfileConfirmationForm";

// const IntervieweeChat: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const activeCandidate = useSelector(
//     (state: RootState) => state.interview.activeCandidate
//   );
//   const [inputMessage, setInputMessage] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   if (!activeCandidate) return null;

//   const {
//     profile,
//     isProfileComplete,
//     status,
//     chatHistory,
//     timerRemaining,
//     isTimerRunning,
//     currentQnAIndex,
//   } = activeCandidate;

//   useEffect(() => {
//     if (status === "PROMPTING" && isProfileComplete) {
//       const now = Date.now();

//       if (
//         !activeCandidate.questionBank ||
//         activeCandidate.questionBank.length === 0
//       ) {
//         const questionBank = generateFallbackQuestions();
//         const firstQuestion = questionBank[0];

//         dispatch(setQuestionBank(questionBank));
//         dispatch(startInterview({ firstQuestion }));
//         dispatch(setTimer(firstQuestion.timeLimit));
//         dispatch(setTimerRunning(true));

//         dispatch(
//           addChatMessage({
//             id: (now + 1).toString(),
//             text: `Thank you, ${profile.name}! Your interview for the Full Stack role is starting now. You will have 6 questions (Easy/Medium/Hard). Good luck!`,
//             sender: "system",
//             timestamp: new Date().toISOString(),
//           })
//         );
//         dispatch(
//           addChatMessage({
//             id: (now + 2).toString(),
//             text: `[EASY Q1] ${firstQuestion.question}`,
//             sender: "ai",
//             timestamp: new Date().toISOString(),
//           })
//         );
//       } else {
//         console.log("STARTING INTERVIEW NOW: Questions loaded from server.");

//         const now = Date.now();
//         const firstQuestion = activeCandidate.questionBank[0];

//         dispatch(startInterview({ firstQuestion }));
//         dispatch(setTimer(firstQuestion.timeLimit));
//         dispatch(setTimerRunning(true));

//         dispatch(
//           addChatMessage({
//             id: (now + 1).toString(),
//             text: `Thank you, ${profile.name}! Your interview for the Full Stack role is starting now. You will have 6 questions (Easy/Medium/Hard). Good luck!`,
//             sender: "system",
//             timestamp: new Date().toISOString(),
//           })
//         );
//         dispatch(
//           addChatMessage({
//             id: (now + 2).toString(),
//             text: `[EASY Q1] ${firstQuestion.question}`,
//             sender: "ai",
//             timestamp: new Date().toISOString(),
//           })
//         );
//       }
//     }
//   }, [status, isProfileComplete, profile, dispatch]);

//   useEffect(() => {
//     if (status === "IN_PROGRESS" && isTimerRunning) {
//       const interval = setInterval(() => {
//         dispatch(decrementTimer());
//       }, 1000);

//       if (timerRemaining === 0) {
//         clearInterval(interval);
//         handleAutoSubmit();
//       }

//       return () => clearInterval(interval);
//     }
//   }, [timerRemaining, isTimerRunning, status, dispatch]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatHistory]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isProcessing) return;
//     if (status === "IN_PROGRESS" && !isTimerRunning) {
//       return;
//     }

//     const messageText = inputMessage.trim();
//     const uniqueId = `${Date.now()}-${Math.random()}`;
//     const userMessage: ChatMessage = {
//       id: uniqueId,
//       text: messageText,
//       sender: "candidate",
//       timestamp: new Date().toISOString(),
//     };
//     dispatch(addChatMessage(userMessage));
//     setInputMessage("");
//     setIsProcessing(true);

//     if (status === "PROMPTING") {
//       setIsProcessing(false);
//     } else if (status === "IN_PROGRESS") {
//       setIsProcessing(true);
//       dispatch(
//         submitAnswerThunk({ answer: messageText, isAutoSubmitted: false })
//       ).finally(() => setIsProcessing(false));
//     }
//   };

//   const handleAutoSubmit = () => {
//     const answer = inputMessage.trim();
//     dispatch(submitAnswerThunk({ answer, isAutoSubmitted: true })).finally(
//       () => {
//         setIsProcessing(false);
//         setInputMessage("");
//       }
//     );
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const currentQnA = activeCandidate.qnaHistory[currentQnAIndex];

//   if (status === "PROMPTING" && !isProfileComplete) {
//     return <ProfileConfirmationForm />;
//   }

//   if (status === "COMPLETED") {
//     return (
//       <Card className="h-full flex flex-col items-center justify-center text-center p-8">
//         <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
//         <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
//         <p className="text-muted-foreground mb-4">
//           Thank you for completing the assessment. Your score and summary are
//           now available in the <b>Interviewer Dashboard</b> tab.
//         </p>

//         <Button onClick={() => dispatch(clearActiveSession())} className="mt-4">
//           <CheckCircle className="h-4 w-4 mr-2" />
//           Acknowledge & Start New
//         </Button>
//       </Card>
//     );
//   }
//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader className="flex flex-row items-center justify-between border-b p-4">
//         <div className="flex items-center space-x-2">
//           <Zap className="w-5 h-5 mr-2 text-blue-500" />
//           <h2 className="text-xl font-semibold">
//             {`Interview: Q${currentQnAIndex + 1} (${currentQnA?.level})`}
//           </h2>
//         </div>

//         {status === "IN_PROGRESS" && (
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center text-sm font-medium text-gray-700">
//               <Clock className="w-4 h-4 mr-1 text-red-500" />
//               Time Remaining:{" "}
//               <span
//                 className={`ml-1 font-mono ${
//                   timerRemaining <= 10
//                     ? "text-red-600 font-bold"
//                     : "text-green-600"
//                 }`}
//               >
//                 {formatTime(timerRemaining)}
//               </span>
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => dispatch(setTimerRunning(!isTimerRunning))}
//             >
//               <Pause className="w-4 h-4 mr-1" />{" "}
//               {isTimerRunning ? "Pause" : "Resume"}
//             </Button>
//           </div>
//         )}
//       </CardHeader>

//       <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//         {chatHistory.map((msg) => (
//           <div
//             key={msg.id}
//             className={`flex ${
//               msg.sender === "candidate" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-[75%] p-3 rounded-xl shadow-md ${
//                 msg.sender === "candidate"
//                   ? "bg-blue-500 text-white rounded-br-none"
//                   : msg.sender === "ai"
//                   ? "bg-white text-gray-800 rounded-tl-none border border-gray-200"
//                   : "bg-yellow-100 text-yellow-800 text-sm italic"
//               }`}
//             >
//               {msg.text}
//               <div className="text-xs text-opacity-70 mt-1 text-right">
//                 {new Date(msg.timestamp).toLocaleTimeString("en-GB", {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </div>
//             </div>
//           </div>
//         ))}

//         {isProcessing && (
//           <div className="flex justify-start">
//             <div className="p-3 rounded-xl bg-white text-gray-800 rounded-tl-none border border-gray-200">
//               <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> AI is
//               processing...
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </CardContent>

//       <CardFooter className="p-4 border-t bg-white">
//         <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
//           <Input
//             placeholder={
//               isTimerRunning
//                 ? "Type your answer or reply..."
//                 : "Interview is paused/not started."
//             }
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             disabled={
//               isProcessing ||
//               (status === "IN_PROGRESS" && !isTimerRunning) ||
//               status === "PROMPTING"
//             }
//             className="flex-1"
//           />
//           <Button
//             type="submit"
//             disabled={
//               isProcessing ||
//               !inputMessage.trim() ||
//               (status === "IN_PROGRESS" && !isTimerRunning) ||
//               status === "PROMPTING"
//             }
//           >
//             {isProcessing ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <Send className="h-4 w-4" />
//             )}
//           </Button>
//         </form>
//       </CardFooter>
//     </Card>
//   );
// };

// export default IntervieweeChat;
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  addChatMessage,
  setTimerRunning,
  startInterview,
  setTimer,
  decrementTimer,
  setQuestionBank,
  clearActiveSession,
} from "@/store/interview/interviewSlice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/store/interview/types";
import { generateFallbackQuestions } from "@/data/fallbackQuestions";
import { Loader2, Zap, Clock, Send, Pause, CheckCircle } from "lucide-react";
import { submitAnswerThunk } from "@/store/interviewThunk";
import { ProfileConfirmationForm } from "./ProfileConfirmationForm";

const IntervieweeChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const activeCandidate = useSelector(
    (state: RootState) => state.interview.activeCandidate
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract values with safe defaults
  const profile = activeCandidate?.profile || { name: "" };
  const isProfileComplete = activeCandidate?.isProfileComplete || false;
  const status = activeCandidate?.status || "PROMPTING";
  const chatHistory = activeCandidate?.chatHistory || [];
  const timerRemaining = activeCandidate?.timerRemaining || 0;
  const isTimerRunning = activeCandidate?.isTimerRunning || false;
  const currentQnAIndex = activeCandidate?.currentQnAIndex || 0;
  const questionBank = activeCandidate?.questionBank || [];

  // Memoize handleAutoSubmit to avoid exhaustive-deps warning
  const handleAutoSubmit = useCallback(() => {
    const answer = inputMessage.trim();
    dispatch(submitAnswerThunk({ answer, isAutoSubmitted: true })).finally(
      () => {
        setIsProcessing(false);
        setInputMessage("");
      }
    );
  }, [inputMessage, dispatch]);

  // Effect 1: Start interview when profile is complete
  useEffect(() => {
    if (!activeCandidate) return;

    if (status === "PROMPTING" && isProfileComplete) {
      const now = Date.now();

      if (!questionBank || questionBank.length === 0) {
        console.log("⚠️ No question bank found, using fallback");
        const fallbackQuestions = generateFallbackQuestions();
        const firstQuestion = fallbackQuestions[0];

        dispatch(setQuestionBank(fallbackQuestions));
        dispatch(startInterview({ firstQuestion }));
        dispatch(setTimer(firstQuestion.timeLimit));
        dispatch(setTimerRunning(true));

        dispatch(
          addChatMessage({
            id: (now + 1).toString(),
            text: `Thank you, ${profile.name}! Your interview for the Full Stack role is starting now. You will have 6 questions (Easy/Medium/Hard). Good luck!`,
            sender: "system",
            timestamp: new Date().toISOString(),
          })
        );
        dispatch(
          addChatMessage({
            id: (now + 2).toString(),
            text: `[${firstQuestion.level} Q1] ${firstQuestion.question}`,
            sender: "ai",
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        console.log("✅ Using AI-generated questions:", questionBank.length);

        const firstQuestion = questionBank[0];

        dispatch(startInterview({ firstQuestion }));
        dispatch(setTimer(firstQuestion.timeLimit));
        dispatch(setTimerRunning(true));

        dispatch(
          addChatMessage({
            id: (now + 1).toString(),
            text: `Thank you, ${profile.name}! Your interview for the Full Stack role is starting now. You will have 6 questions (Easy/Medium/Hard). Good luck!`,
            sender: "system",
            timestamp: new Date().toISOString(),
          })
        );
        dispatch(
          addChatMessage({
            id: (now + 2).toString(),
            text: `[${firstQuestion.level} Q1] ${firstQuestion.question}`,
            sender: "ai",
            timestamp: new Date().toISOString(),
          })
        );
      }
    }
  }, [
    status,
    isProfileComplete,
    profile.name,
    questionBank,
    dispatch,
    activeCandidate,
  ]);

  // Effect 2: Timer countdown
  useEffect(() => {
    if (!activeCandidate) return;

    if (status === "IN_PROGRESS" && isTimerRunning) {
      const interval = setInterval(() => {
        dispatch(decrementTimer());
      }, 1000);

      if (timerRemaining === 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }

      return () => clearInterval(interval);
    }
  }, [
    timerRemaining,
    isTimerRunning,
    status,
    dispatch,
    handleAutoSubmit,
    activeCandidate,
  ]);

  // Effect 3: Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ✅ NOW we can do conditional rendering AFTER all hooks
  if (!activeCandidate) {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;
    if (status === "IN_PROGRESS" && !isTimerRunning) {
      return;
    }

    const messageText = inputMessage.trim();
    const uniqueId = `${Date.now()}-${Math.random()}`;
    const userMessage: ChatMessage = {
      id: uniqueId,
      text: messageText,
      sender: "candidate",
      timestamp: new Date().toISOString(),
    };
    dispatch(addChatMessage(userMessage));
    setInputMessage("");
    setIsProcessing(true);

    if (status === "PROMPTING") {
      setIsProcessing(false);
    } else if (status === "IN_PROGRESS") {
      setIsProcessing(true);
      dispatch(
        submitAnswerThunk({ answer: messageText, isAutoSubmitted: false })
      ).finally(() => setIsProcessing(false));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQnA = activeCandidate.qnaHistory[currentQnAIndex];

  if (status === "PROMPTING" && !isProfileComplete) {
    return <ProfileConfirmationForm />;
  }

  if (status === "COMPLETED") {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
        <p className="text-muted-foreground mb-4">
          Thank you for completing the assessment. Your score and summary are
          now available in the <b>Interviewer Dashboard</b> tab.
        </p>

        <Button onClick={() => dispatch(clearActiveSession())} className="mt-4">
          <CheckCircle className="h-4 w-4 mr-2" />
          Acknowledge & Start New
        </Button>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-semibold">
            {`Interview: Q${currentQnAIndex + 1} (${
              currentQnA?.level || "N/A"
            })`}
          </h2>
        </div>

        {status === "IN_PROGRESS" && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 mr-1 text-red-500" />
              Time Remaining:{" "}
              <span
                className={`ml-1 font-mono ${
                  timerRemaining <= 10
                    ? "text-red-600 font-bold"
                    : "text-green-600"
                }`}
              >
                {formatTime(timerRemaining)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(setTimerRunning(!isTimerRunning))}
            >
              <Pause className="w-4 h-4 mr-1" />{" "}
              {isTimerRunning ? "Pause" : "Resume"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "candidate" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-xl shadow-md ${
                msg.sender === "candidate"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : msg.sender === "ai"
                  ? "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  : "bg-yellow-100 text-yellow-800 text-sm italic"
              }`}
            >
              {msg.text}
              <div className="text-xs text-opacity-70 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-white text-gray-800 rounded-tl-none border border-gray-200">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> AI is
              processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            placeholder={
              isTimerRunning
                ? "Type your answer or reply..."
                : "Interview is paused/not started."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={
              isProcessing ||
              (status === "IN_PROGRESS" && !isTimerRunning) ||
              status === "PROMPTING"
            }
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={
              isProcessing ||
              !inputMessage.trim() ||
              (status === "IN_PROGRESS" && !isTimerRunning) ||
              status === "PROMPTING"
            }
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default IntervieweeChat;
