"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@testComponents/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";
import { Progress } from "@testComponents/components/ui/progress";
import { getSectionStats, getTestStats } from "@testComponents/lib/test-utils";
import { Section, UserAnswer } from "@testComponents/lib/types";
import { SectionResult, TestResult } from "@testComponents/store/test-store";
import { BarChart3, CheckCircle2, Clock } from "lucide-react";
import { useMemo } from "react";

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
    <span
      className={`${bg} ${text} text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded`}
    >
      {count} {symbol}
    </span>
  );
};

// Component to display answer comparison item
const AnswerComparisonItem = ({
  questionNumber,
  questionText,
  userAnswer,
  correctAnswer,
  isCorrect,
  isAnswered = true,
}: {
  questionNumber: number;
  questionText?: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  isAnswered?: boolean;
}) => {
  // Format the answers for display
  const formatAnswer = (answer: any) => {
    if (!answer) return "-";

    if (typeof answer === "string") {
      return (
        <div className="flex flex-col gap-1">
          {answer.split("\n").map((line: string, lineIdx: number) => (
            <span key={lineIdx}>{line}</span>
          ))}
        </div>
      );
    } else if (Array.isArray(answer)) {
      return (
        <div className="flex flex-col gap-1">
          {answer.map((line, lineIdx: number) => (
            <span key={lineIdx}>{line[1]}</span>
          ))}
        </div>
      );
    }
  };

  return (
    <div className={`border rounded-md p-2 flex flex-col gap-2`}>
      <div className="flex items-start">
        <div className="text-xs font-bold w-[50px]">Q{questionNumber}</div>
        {questionText && (
          <div className="text-xs text-gray-700 dark:text-gray-300 flex-1 flex flex-col gap-1 font-bold">
            {questionText.split("\n").map((line: string, lineIdx: number) => (
              <span key={lineIdx}>{line}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-5 items-start">
        {isAnswered ? (
          <>
            <div
              className={`text-xs ml-[50px] ${
                isCorrect
                  ? "text-green-600 dark:text-green-600 font-bold"
                  : "text-red-600 line-through"
              }`}
            >
              {formatAnswer(userAnswer)}
            </div>
            {!isCorrect && (
              <div className="text-xs flex-1 text-green-600 dark:text-green-600 font-bold">
                {formatAnswer(correctAnswer)}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-xs text-gray-500 ml-[50px]">Not answered</div>
            <div className="text-xs flex-1 text-green-600 dark:text-green-600 font-bold">
              {formatAnswer(correctAnswer)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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
              section.percentageScore
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

// SectionAccordionItem component for the question review accordion
const SectionAccordionItem = ({ section }: { section: SectionResult }) => {
  if (!section) return null;
  return (
    <AccordionItem
      key={section.id}
      value={section.id}
      className="border rounded-md overflow-hidden"
    >
      <AccordionTrigger className="hover:bg-muted px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
        <div className="flex justify-between items-center w-full">
          <span>{section.title}</span>
          <div className="flex gap-1 mr-4 sm:mr-8">
            <StatusBadge count={section.correctCount} type="correct" />
            <StatusBadge count={section.incorrectCount} type="incorrect" />
            <StatusBadge count={section.unansweredCount} type="unanswered" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 pb-1.5 sm:pb-2">
        <div className="flex flex-col gap-4 sm:gap-4 p-2 sm:p-4">
          {/* Use pre-calculated question data */}
          {section?.questions.map((question, index) => (
            <AnswerComparisonItem
              key={index}
              questionNumber={question.questionNumber}
              questionText={question.questionText}
              userAnswer={question.userAnswer}
              correctAnswer={question.correctAnswer}
              isCorrect={question.isCorrect}
              isAnswered={question.isAnswered}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export interface TestResultsProps {
  currentTest: any;
  testResults: TestResult;
}

export default function TestResults({
  currentTest,
  testResults,
}: TestResultsProps) {
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
              {totalScore} / {maxPossibleScore}
              <span className="text-xs text-muted-foreground ml-2">points</span>
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
                  scorePercentage
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
            {testResults.sectionResults.map((section: any) => (
              <SectionPerformance key={section.id} section={section} />
            ))}
          </div>
        </div>

        {/* Question Review */}
        <div>
          <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
            Question Review
          </h3>
          <Accordion
            type="multiple"
            defaultValue={testResults.sectionResults.map(
              (section: any) => section.id
            )}
            className="w-full space-y-1.5 sm:space-y-2"
          >
            {testResults.sectionResults.map((section: any, index: number) => {
              return (
                <SectionAccordionItem key={section.id} section={section} />
              );
            })}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
