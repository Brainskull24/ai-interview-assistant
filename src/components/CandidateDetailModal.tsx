import React from "react";
import { Candidate, QnA } from "@/store/interview/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Zap, MessageCircle, User, Award, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
}

const getScoreColor = (score: number | null): string => {
  if (score === null) return "bg-gray-200";
  if (score >= 8) return "bg-green-100 text-green-700";
  if (score >= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
}) => {
  const totalPossibleTime = candidate.qnaHistory.reduce(
    (sum, q) => sum + q.timeLimit,
    0
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl md:max-w-5xl  max-h-[90vh] flex flex-col p-0">
        {/* Header Section */}
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle className="flex items-center text-3xl font-bold">
            <Zap className="w-6 h-6 mr-2 text-blue-600" />
            {candidate.profile.name}
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of the Full Stack Interview.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="overflow-y-auto px-6 py-4 space-y-8">
          {/* Summary Block */}
          <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg bg-blue-50">
            <div className="flex flex-col items-center justify-center border-r">
              <Award className="h-6 w-6 text-blue-600 mb-1" />
              <p className="text-xs font-medium text-gray-600">Final Score</p>
              <p className="text-3xl font-extrabold text-blue-800">
                {candidate.finalScore || "--"} / 60
              </p>
            </div>
            <div className="flex flex-col items-center justify-center border-r">
              <Clock className="h-6 w-6 text-gray-600 mb-1" />
              <p className="text-xs font-medium text-gray-600">
                Total Time Available
              </p>
              <p className="text-xl font-bold">
                {Math.floor(totalPossibleTime / 60)}m {totalPossibleTime % 60}s
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <User className="h-6 w-6 text-gray-600 mb-1" />
              <p className="text-xs font-medium text-gray-600">Contact</p>
              <p className="text-sm font-bold">{candidate.profile.phone}</p>
              <p className="text-xs text-gray-500">{candidate.profile.email}</p>
            </div>
          </div>

          {/* AI Summary */}
          <div className="gap-2 flex flex-col my-10">
            <h3 className="text-xl font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              AI Final Summary
            </h3>
            <Card className="p-4 bg-white shadow-inner">
              <p className="text-gray-700 italic">
                {candidate.finalSummary ||
                  "AI summary is not available for this session."}
              </p>
            </Card>
          </div>

          {/* Q&A History */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              Q&A Breakdown (6 Questions)
            </h3>
            {candidate.qnaHistory.map((qna: QnA, index: number) => (
              <Card
                key={qna.id}
                className="p-4 border-l-4 border-blue-500 shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">
                      Q{index + 1}: {qna.level}
                    </span>
                    <Badge
                      variant="secondary"
                      className={getScoreColor(qna.score)}
                    >
                      Score:{" "}
                      {qna.score !== null ? `${qna.score}/10` : "Pending"}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    Time: {qna.timeTaken !== null ? `${qna.timeTaken}s` : "--"}
                  </span>
                </div>

                {/* Question */}
                <p className="text-sm italic text-gray-700 mb-3">
                  <span className="font-semibold not-italic">Question:</span>{" "}
                  {qna.question}
                </p>
                <div className="p-3 bg-gray-100 rounded-md border border-gray-200">
                  <p className="font-semibold text-sm mb-1">
                    Candidate Answer:
                  </p>
                  <p className="text-sm whitespace-pre-wrap font-mono bg-white p-2 rounded">
                    {qna.answer || "No answer submitted."}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailModal;
