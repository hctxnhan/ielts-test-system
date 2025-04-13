"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getSectionStats,
  getStatusColorClass,
  getTestStats,
} from "@/lib/test-utils";
import { useTestStore } from "@/store/test-store";
import { BarChart3, CheckCircle2, Clock } from "lucide-react";
import { useMemo } from "react";

// Helper function to determine color based on percentage score
const getScoreColorClass = (percentage: number) => {
  if (percentage >= 70) return "text-green-500";
  if (percentage >= 50) return "text-amber-500";
  return "text-rose-500";
};

// Helper function to determine background color based on percentage score
const getScoreBgClass = (percentage: number) => {
  if (percentage >= 70) return "bg-green-500";
  if (percentage >= 50) return "bg-amber-500";
  return "bg-rose-500";
};

// ScoreCircle component for the circular progress visualization
const ScoreCircle = ({ percentage }: { percentage: number }) => {
  const colorClass = getScoreColorClass(percentage);

  return (
    <div className="relative w-28 h-28 lg:w-32 lg:h-32">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{percentage}%</span>
        <span className="text-xs text-muted-foreground">Your Score</span>
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
  <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
    <Icon className={`h-5 w-5 ${iconColor} shrink-0`} />
    <div className="text-sm">
      <div className="font-medium">{title}</div>
      <div className="text-muted-foreground">{value}</div>
    </div>
  </div>
);

// StatusBadge component for section question stats
const StatusBadge = ({
  count,
  type,
}: {
  count: number;
  type: "correct" | "incorrect" | "unanswered";
}) => {
  if (count <= 0) return null;

  const config = {
    correct: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-800 dark:text-green-100",
      symbol: "✓",
    },
    incorrect: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-800 dark:text-red-100",
      symbol: "✗",
    },
    unanswered: {
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-800 dark:text-gray-300",
      symbol: "-",
    },
  };

  const { bg, text, symbol } = config[type];

  return (
    <span className={`${bg} ${text} text-xs px-1.5 py-0.5 rounded`}>
      {count} {symbol}
    </span>
  );
};

// QuestionButton component for individual question state buttons
const QuestionButton = ({
  displayNumber,
  status,
}: {
  displayNumber: number;
  status: string;
}) => {
  const statusColor = getStatusColorClass(status);

  return (
    <Button
      variant="outline"
      size="sm"
      className="relative h-8 w-9 flex items-center justify-center p-0 overflow-hidden hover:bg-muted group"
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-xs transition-opacity">{displayNumber}</span>
      </div>
      <span
        className={`absolute bottom-0 left-0 right-0 h-1 ${statusColor}`}
      ></span>
    </Button>
  );
};

// SectionPerformance component for section score visualization
const SectionPerformance = ({ section, answers }) => {
  const {
    sectionAnswers,
    sectionScore,
    sectionTotalScore,
    sectionPercentage,
    sectionTotalQuestions,
  } = getSectionStats(section, answers);

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
        <div className="flex items-center gap-1 mb-1">
          <Progress
            value={sectionPercentage}
            className={`h-2 flex-1 bg-muted ${getScoreColorClass(
              sectionPercentage
            )}`}
          />
          <span className="text-xs font-medium w-8 text-right">
            {sectionPercentage}%
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div>
            {sectionScore}/{sectionTotalScore} points
          </div>
          <div>
            {sectionAnswers.length}/{sectionTotalQuestions} answered
          </div>
        </div>
      </div>
    </div>
  );
};

// SectionAccordionItem component for the question review accordion
const SectionAccordionItem = ({ section, answers, getAnswerStatus }) => {
  const {
    sectionCorrectAnswers: correctCount,
    sectionIncorrectAnswers: incorrectCount,
    sectionUnansweredQuestions: unansweredCount,
  } = getSectionStats(section, answers);

  return (
    <AccordionItem
      key={section.id}
      value={section.id}
      className="border rounded-md overflow-hidden"
    >
      <AccordionTrigger className="hover:bg-muted px-3 py-2 text-sm font-medium">
        <div className="flex justify-between items-center w-full">
          <span>{section.title}</span>
          <div className="flex gap-1 mr-8">
            <StatusBadge count={correctCount} type="correct" />
            <StatusBadge count={incorrectCount} type="incorrect" />
            <StatusBadge count={unansweredCount} type="unanswered" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 pb-2">
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-2">
          {section.questions.map((question, qIndex) => {
            // Check if this is a partial question with a range
            if (
              question.partialEndingIndex !== undefined &&
              question.index !== undefined &&
              question.partialEndingIndex > question.index
            ) {
              // Handle partial questions with range (multiple numbered questions)
              const individualQuestions = [];
              const startIndex = question.index;
              const endIndex = question.partialEndingIndex;

              for (let i = startIndex; i <= endIndex; i++) {
                const j = i - startIndex;
                const subQuestion = question.subQuestions?.[j];
                const subId = subQuestion?.subId;

                // Determine question status for this specific sub-question
                const status = subId
                  ? answers[subId]
                    ? answers[subId].isCorrect
                      ? "correct"
                      : "incorrect"
                    : "untouched"
                  : "untouched";

                individualQuestions.push(
                  <QuestionButton
                    key={`${qIndex}-${i}`}
                    displayNumber={i + 1}
                    status={status}
                  />
                );
              }

              return individualQuestions;
            }

            // For standard questions, render as a single question with its index
            const status = getAnswerStatus(question.id);
            const displayNumber =
              (question.index !== undefined ? question.index : 0) + 1;

            return (
              <QuestionButton
                key={question.id}
                displayNumber={displayNumber}
                status={status}
              />
            );
          })}
        </div>
        <div className="flex justify-end text-xs text-muted-foreground mt-1 px-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Incorrect</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default function TestResults() {
  const { currentTest, progress, resetTest } = useTestStore();

  if (!currentTest || !progress) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>No test results available.</p>
      </div>
    );
  }

  // Calculate time taken
  const startTime = new Date(progress.startedAt).getTime();
  const endTime = progress.completedAt
    ? new Date(progress.completedAt).getTime()
    : new Date().getTime();

  const timeTakenSeconds = Math.floor((endTime - startTime) / 1000);
  const timeTakenMinutes = Math.floor(timeTakenSeconds / 60);
  const remainingSeconds = timeTakenSeconds % 60;

  // Calculate test statistics using our utility function
  const testStats = useMemo(() => {
    return getTestStats(currentTest, progress.answers);
  }, [currentTest, progress.answers]);

  const {
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    totalScore,
    maxPossibleScore,
    percentageScore: scorePercentage,
  } = testStats;

  // Estimate band score
  const estimatedBandScore = useMemo(() => {
    return Math.min(9, Math.max(1, Math.round(scorePercentage / 11.1)));
  }, [scorePercentage]);

  // Get answer status for a question or sub-question using our utility functions
  const getAnswerStatus = (questionId: string) => {
    if (!progress.answers[questionId]) return "untouched";
    if (progress.answers[questionId].isCorrect) return "correct";
    return "incorrect";
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card className="overflow-hidden border-2 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-2">
          <CardTitle className="text-xl flex items-center justify-center">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2">
              <BarChart3 className="h-4 w-4" />
            </span>
            {currentTest.title} - {currentTest.type.toUpperCase()}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          {/* Stats Summary */}

          <div className="flex flex-col justify-between items-center gap-6">
            <ScoreCircle percentage={scorePercentage} />

            <div className="grid grid-cols-3 gap-3 w-full">
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
          <div className="bg-muted/40 rounded-lg p-3 flex items-center justify-between">
            <div className="text-sm">
              <h3 className="font-medium">Final Score</h3>
              <div className="text-lg font-semibold mt-1">
                {totalScore} / {maxPossibleScore}
                <span className="text-xs text-muted-foreground ml-2">
                  points
                </span>
              </div>
            </div>

            <div className="space-y-1 flex-1 max-w-xs mx-auto px-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Band Score Estimate</span>
                <span>{estimatedBandScore}/9</span>
              </div>
              <div className="bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${getScoreBgClass(
                    scorePercentage
                  )}`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <BarChart3 className="h-4 w-4 mr-1 text-primary" />
              Section Performance
            </h3>
            <div className="space-y-2 text-sm">
              {currentTest.sections.map((section) => (
                <SectionPerformance
                  key={section.id}
                  section={section}
                  answers={progress.answers}
                />
              ))}
            </div>
          </div>

          {/* Question Review */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-primary" />
              Question Review
            </h3>
            <Accordion
              type="multiple"
              defaultValue={currentTest.sections.map((section) => section.id)}
              className="w-full space-y-2"
            >
              {currentTest.sections.map((section) => (
                <SectionAccordionItem
                  key={section.id}
                  section={section}
                  answers={progress.answers}
                  getAnswerStatus={getAnswerStatus}
                />
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
