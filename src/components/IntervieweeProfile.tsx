"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  startNewSession,
  updateProfile,
  addChatMessage,
  setQuestionBank,
} from "@/store/interview/interviewSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2, Zap } from "lucide-react";
import { AppDispatch } from "@/store/store";

interface IntervieweeProfileProps {
  onStartChat: () => void;
}

const IntervieweeProfile: React.FC<IntervieweeProfileProps> = ({
  onStartChat,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploaded" | "processing" | "done"
  >("idle");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    if (uploadedFile) {
      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(uploadedFile.type)
      ) {
        setError("Invalid file type. Please upload a PDF or DOCX.");
        setFile(null);
        setStatus("idle");
        return;
      }
      setFile(uploadedFile);
      setError(null);
      setStatus("uploaded");
    }
  };

  const processFile = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setIsLoading(true);
    setStatus("processing");
    setError(null);

    try {
      setStatus("processing");
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to process resume on the server."
        );
      }

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      const { finalDetails, questionBank } = data;
      const { name, email, phone, rawText } = finalDetails;

      console.log(name, email, phone);

      if (finalDetails.name && questionBank.length > 0) {
        console.log("questionBank from AI:", questionBank);
        dispatch(startNewSession());
        dispatch(setQuestionBank(questionBank));

        dispatch(
          addChatMessage({
            id: Date.now().toString(),
            text: `Welcome! I've successfully analyzed your resume and am ready to start.`,
            sender: "system",
            timestamp: new Date().toISOString(),
          })
        );

        dispatch(
          updateProfile({
            name: name || "",
            email: email || "",
            phone: phone || "",
            resumeRawText: rawText || "",
          })
        );
      }

      setStatus("done");
      onStartChat();
    } catch (err) {
      console.error(err);
      setError(`Failed to process resume: ${(err as Error).message}`);
      setStatus("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = {
    idle: "Upload your Resume to Start",
    uploaded: "Process Resume & Start Setup",
    processing: "Processing File...",
    done: "Starting Chatbot...",
  }[status];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <Zap className="w-6 h-6 mr-2 text-blue-600" />
            AI Interview Assistant
          </CardTitle>
          <CardDescription>
            Upload your resume (PDF/DOCX) to begin your full-stack (React/Node)
            interview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label htmlFor="resume-upload" className="text-sm font-medium">
              Upload File (.pdf, .docx)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf, .docx"
                onChange={handleFileChange}
                disabled={isLoading}
                className="flex-1"
              />
              {file && status === "uploaded" && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <Button
            onClick={processFile}
            disabled={!file || isLoading || status === "done"}
            className="w-full h-12 text-lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>

          {error && (
            <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md border border-red-200">
              Error: {error}
            </p>
          )}

          {status === "done" && (
            <p className="text-sm text-green-600 flex items-center">
              <Check className="w-4 h-4 mr-1" /> Profile data parsed!
              Redirecting to chat...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntervieweeProfile;
