"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Candidate } from "@/store/interview/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Eye, ExternalLink, TrendingUp, Users } from "lucide-react";
import CandidateDetailModal from "./CandidateDetailModal";
import { Input } from "./ui/input";

const getScoreTextColor = (score: number | null): string => {
  if (score === null) return "text-gray-500";
  if (score >= 45) return "text-green-600";
  if (score >= 30) return "text-yellow-600";
  return "text-red-600";
};

const InterviewerDashboard: React.FC = () => {
  const allCandidates = useSelector(
    (state: RootState) => state.interview.candidates
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score");

  const completedCandidates = allCandidates.filter(
    (c) => c.status === "COMPLETED"
  );
  const averageScore = completedCandidates.length
    ? completedCandidates.reduce((sum, c) => sum + (c.finalScore || 0), 0) /
      completedCandidates.length
    : 0;

  const sortedCandidates = [...allCandidates]
    .filter(
      (candidate) =>
        candidate.profile.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        candidate.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.finalScore || 0) - (a.finalScore || 0);
        case "name":
          return a.profile.name.localeCompare(b.profile.name);
        case "date":
          return Number(b.id) - Number(a.id);
        default:
          return 0;
      }
    });

  return (
    <div className="h-full flex flex-col space-y-4 px-9">
      <h2 className="text-3xl font-extrabold text-gray-900 flex items-center mb-4">
        <Eye className="w-7 h-7 mr-3 text-blue-600" /> Interviewer Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interviews
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCandidates.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedCandidates.length} completed
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageScore.toFixed(1)} / 60
            </div>
            <p className="text-xs text-muted-foreground">
              Highest:{" "}
              {Math.max(...completedCandidates.map((c) => c.finalScore || 0))} /
              60
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="p-4 shadow-md">
        <CardTitle className="text-lg mb-4">Candidate List</CardTitle>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortBy === "score" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("score")}
            >
              Score
            </Button>
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("date")}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("name")}
            >
              Name
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex-1 overflow-y-auto shadow-lg mb-10 p-0">
        <div className="divide-y">
          {sortedCandidates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No matching candidates found.
            </div>
          ) : (
            sortedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition duration-150"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">
                    {candidate.profile.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {candidate.profile.email}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600">
                      Final Score
                    </p>
                    <p
                      className={`text-2xl font-bold ${getScoreTextColor(
                        candidate.finalScore
                      )}`}
                    >
                      {candidate.finalScore || "--"} / 60
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedCandidate(candidate)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default InterviewerDashboard;
