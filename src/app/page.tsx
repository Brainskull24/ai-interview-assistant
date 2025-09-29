"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import IntervieweeProfile from "@/components/IntervieweeProfile";
import IntervieweeChat from "@/components/IntervieweeChat";
import InterviewerDashboard from "@/components/InterviewerDashboard";
import WelcomeBackModal from "@/components/WelcomeBackModal";
import { clearActiveSession } from "@/store/interview/interviewSlice";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const activeCandidate = useSelector(
    (state: RootState) => state.interview.activeCandidate
  );
  const [activeTab, setActiveTab] = useState<"interviewee" | "interviewer">(
    "interviewee"
  );
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    if (
      !hasCheckedSession &&
      activeCandidate &&
      activeCandidate.status !== "COMPLETED"
    ) {
      setShowWelcomeModal(true);
    }
    setHasCheckedSession(true);
  }, [activeCandidate, hasCheckedSession]);

  const handleStartChat = () => {
    setActiveTab("interviewee");
  };

  const renderIntervieweeContent = () => {
    if (!activeCandidate) {
      return <IntervieweeProfile onStartChat={handleStartChat} />;
    }
    return <IntervieweeChat />;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="p-4 bg-white border-b shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600 text-center">
          Swipe AI Interview Platform 🚀
        </h1>
      </header>

      <main className="flex-1 p-4 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "interviewee" | "interviewer")
          }
          className="h-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
            <TabsTrigger value="interviewee">Interviewee (Chat)</TabsTrigger>
            <TabsTrigger value="interviewer">
              Interviewer (Dashboard)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interviewee" className="h-[calc(100%-40px)]">
            <div className="h-full w-full max-w-3xl mx-auto">
              {renderIntervieweeContent()}
            </div>
          </TabsContent>

          <TabsContent value="interviewer" className="h-[calc(100%-40px)]">
            <InterviewerDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {showWelcomeModal &&
        activeCandidate &&
        activeCandidate.status !== "COMPLETED" && (
          <WelcomeBackModal
            candidateName={activeCandidate.profile.name || "Candidate"}
            onResume={() => setShowWelcomeModal(false)}
            onStartNew={() => {
              dispatch(clearActiveSession());
              setShowWelcomeModal(false);
            }}
          />
        )}
    </div>
  );
}
