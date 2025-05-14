"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";
import { Progress } from "@testComponents/components/ui/progress";
import { SectionResult, Test, TestResult } from "@testComponents/lib/types";
import { BarChart3, CheckCircle2, Clock, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "@testComponents/components/ui/button";
import { Dialog, DialogContent } from "@testComponents/components/ui/dialog";
import TestReview from "./test-review-container";

// Helper function to determine color based on percentage score
const getScoreColorClass = (percentage: number) => {
  if (percentage == 0) return "bg-neutral-200";
  if (percentage >= 70) return "text-green-500";
  if (percentage >= 50) return "text-amber-500";
  return "text-rose-500";
};

// Helper function to determine background color based on percentage score
const getScoreBgClass = (percentage: number) => {
  if (percentage == 0) return "bg-neutral-200";
  if (percentage >= 70) return "bg-green-500";
  if (percentage >= 50) return "bg-amber-500";
  return "bg-rose-500";
};

// ScoreCircle component for the circular progress visualization
const ScoreCircle = ({ percentage }: { percentage: number }) => {
  const colorClass = getScoreColorClass(percentage);

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold">{percentage}%</span>
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          Your Score
        </span>
      </div>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-muted stroke-current"
          strokeWidth="8"
          fill="transparent"
          r="46"
          cx="50"
          cy="50"
        />
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth="8"
          strokeLinecap="round"
          fill="transparent"
          r="46"
          cx="50"
          cy="50"
          strokeDasharray={`${2 * Math.PI * 46}`}
          strokeDashoffset={`${2 * Math.PI * 46 * (1 - percentage / 100)}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
    </div>
  );
};

// MetricCard component for the time, accuracy, and completion metrics
const MetricCard = ({
  icon: Icon,
  title,
  value,
  iconColor = "text-primary",
}: {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  iconColor?: string;
}) => (
  <div className="flex items-center gap-1.5 sm:gap-2 bg-muted p-1.5 sm:p-2 rounded-md">
    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor} shrink-0`} />
    <div className="text-xs sm:text-sm">
      <div className="font-medium">{title}</div>
      <div className="text-muted-foreground">{value}</div>
    </div>
  </div>
);

// SectionPerformance component for section score visualization
const SectionPerformance = ({ section }: { section: SectionResult }) => {
  if (!section) return null;
  return (
    <div
      key={section.id}
      className="p-2 border rounded-md flex flex-col sm:flex-row sm:items-center"
    >
      <div className="sm:w-1/4 mb-1 sm:mb-0">
        <h4 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
          {section.title}
        </h4>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-1 mb-1 ">
          <Progress
            value={section?.percentageScore}
            className={`h-2 flex-1 bg-muted ${getScoreColorClass(
              section.percentageScore,
            )}`}
          />
          <span className="text-xs font-medium w-8 text-right">
            {section.percentageScore}%
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div>
            {section.totalScore}/{section.maxScore} points
          </div>
          <div>
            {section.totalCount - section.unansweredCount}/{section.totalCount}{" "}
            answered
          </div>
        </div>
      </div>
    </div>
  );
};

export interface TestResultsProps {
  currentTest: Test;
  testResults: TestResult;
}

export default function TestResults({
  currentTest,
  testResults,
}: TestResultsProps) {
  const [showReview, setShowReview] = useState(false);

  if (!currentTest) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>No test results available.</p>
      </div>
    );
  }

  const startTime = new Date(testResults.startedAt).getTime();
  const endTime = testResults.completedAt
    ? new Date(testResults.completedAt).getTime()
    : new Date().getTime();

  const timeTakenSeconds = Math.floor((endTime - startTime) / 1000);
  const timeTakenMinutes = Math.floor(timeTakenSeconds / 60);
  const remainingSeconds = timeTakenSeconds % 60;

  const {
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    totalScore,
    maxPossibleScore,
    percentageScore: scorePercentage,
  } = testResults;

  // Estimate band score
  const estimatedBandScore = useMemo(() => {
    return Math.min(9, Math.max(1, Math.round(scorePercentage / 11.1)));
  }, [scorePercentage]);

  return (
    <>
      <Card className="overflow-hidden border-2 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-2 px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-xl flex items-center justify-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-2">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            </span>
            {currentTest.title} - {currentTest.type.toUpperCase()}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-5 pt-4 sm:pt-5 px-3 sm:px-6">
          {/* Stats Summary */}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <ScoreCircle percentage={scorePercentage} />

            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
              <MetricCard
                icon={Clock}
                title="Time"
                value={`${timeTakenMinutes}m ${remainingSeconds}s`}
              />
              <MetricCard
                icon={CheckCircle2}
                title="Accuracy"
                value={`${correctAnswers}/${answeredQuestions}`}
                iconColor="text-green-500"
              />
              <MetricCard
                icon={BarChart3}
                title="Completion"
                value={`${answeredQuestions}/${totalQuestions}`}
              />
            </div>
          </div>

          {/* Score Summary */}
          <div className="bg-muted/40 rounded-lg p-2 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-sm w-full sm:w-auto">
              <h3 className="font-medium text-center sm:text-left">
                Final Score
              </h3>
              <div className="text-lg font-semibold mt-1 text-center sm:text-left">
                {totalScore.toFixed(1)} / {maxPossibleScore}
                <span className="text-xs text-muted-foreground ml-2">
                  points
                </span>
              </div>
            </div>

            <div className="space-y-1 flex-1 w-full sm:max-w-xs sm:mx-auto px-2">
              <div className="flex text-sm text-muted-foreground gap-4">
                <span>Band Score Estimate</span>
                <span className="font-bold">{estimatedBandScore}/9</span>
              </div>
              <div className="bg-muted h-1.5 sm:h-2 rounded-full overflow-hidden bg-neutral-100">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${getScoreBgClass(
                    scorePercentage,
                  )}`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-2 flex items-center">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
              Section Performance
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              {testResults.sectionResults.map((section: SectionResult) => (
                <SectionPerformance key={section.id} section={section} />
              ))}
            </div>
          </div>

          {/* Question Review */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowReview(true)}
              className="w-full sm:w-auto"
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              Review Answers
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-[90vw] overflow-y-auto">
          <div className="min-h-fit">
            <TestReview
              test={currentTest}
              testResults={testResults}
              onBack={() => setShowReview(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
