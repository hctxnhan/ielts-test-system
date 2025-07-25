'use client';

import { Button } from '@testComponents/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@testComponents/components/ui/card';
import { Progress } from '@testComponents/components/ui/progress';
import { SectionResult, Test, TestResult } from '@testComponents/lib/types';
import { BarChart3, CheckCircle2, Clock, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import TestReview from './test-review-container';
import { getIeltsBandScore } from '@testComponents/utils/calculatingBandScore';

// Helper function to determine color based on percentage score
const getScoreColorClass = (percentage: number) => {
  if (percentage == 0) return 'bg-neutral-200';
  if (percentage >= 70) return 'text-green-500';
  if (percentage >= 50) return 'text-amber-500';
  return 'text-rose-500';
};

// Helper function to determine background color based on percentage score
const getScoreBgClass = (percentage: number) => {
  if (percentage == 0) return 'bg-neutral-200';
  if (percentage >= 70) return 'bg-green-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
};

// ScoreCircle component for the circular progress visualization
const ScoreCircle = ({ percentage }: { percentage: number }) => {
  const colorClass = getScoreColorClass(percentage);

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">{percentage}%</span>{' '}
      </div>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-muted stroke-current"
          strokeWidth="6"
          fill="transparent"
          r="46"
          cx="50"
          cy="50"
        />
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth="6"
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
  iconColor = 'text-primary'
}: {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  iconColor?: string;
}) => (
  <div className="flex flex-col items-center gap-3 bg-muted/50 border border-muted p-4 sm:p-5 lg:p-6 rounded-lg hover:bg-muted/70 transition-colors">
    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${iconColor} shrink-0`} />
    <div className="text-center">
      <div className="font-bold text-sm sm:text-base lg:text-lg mb-1">{title}</div>
      <div className="text-muted-foreground font-semibold text-base sm:text-lg lg:text-xl">{value}</div>
    </div>
  </div>
);

// SectionPerformance component for section score visualization
const SectionPerformance = ({ section, skill }: { section: SectionResult, skill: string }) => {
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
          {
            skill !== 'writing' && <div>
              {section.totalScore}/{section.maxScore} điểm
            </div>
          }

          <div>
            {section.totalCount - section.unansweredCount}/{section.totalCount}{' '}
            đã trả lời
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

export default function TestResults({ currentTest, testResults }: TestResultsProps) {
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
    percentageScore: scorePercentage
  } = testResults;


  // Estimate band score
  // const estimatedBandScore = useMemo(() => {
  //   return Math.min(9, Math.max(1, Math.round(scorePercentage / 11.1)));
  // }, [scorePercentage]);

  const estimatedBandScore = useMemo(() => {
    let testType = currentTest.type?.toLowerCase()
    if (testType === 'reading') testType = 'academic_reading'
    return getIeltsBandScore(testType, correctAnswers) ?? 0;
  }, [currentTest.type, correctAnswers]);


  return (
    <>
      <Card className="overflow-hidden border-2 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4 px-4 sm:px-8 py-6 sm:py-8">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl flex items-center justify-center font-bold">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center mr-3 sm:mr-4">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </span>
            {currentTest.title} -{' '}
            {(currentTest.skill ?? currentTest.type ?? '').toUpperCase()}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 px-4 sm:px-8">
          {/* Stats Summary */}

          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-10">
            <div className="flex-shrink-0">
              <ScoreCircle percentage={scorePercentage} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full lg:flex-1">
              <MetricCard
                icon={Clock}
                title="Thời gian làm bài"
                value={`${timeTakenMinutes}m ${remainingSeconds}s`}
              />
              {/* <MetricCard
                icon={CheckCircle2}
                title="Số câu đúng"
                value={`${correctAnswers}/${totalQuestions}`}
                iconColor
                ="text-green-500"
              /> */}
              {/* <MetricCard
                icon={BarChart3}
                title="Band Ước Tính"
                value={`${estimatedBandScore}/${9}`}
              /> */}
              {currentTest.type?.toLowerCase() !== 'writing' && (
                <MetricCard
                  icon={BarChart3}
                  title="Band Ước Tính"
                  value={`${estimatedBandScore}/${9}`}
                />
              )}
            </div>
          </div>

          {/* Section Breakdown */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium mb-2 flex items-center">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-primary" />
              Hiệu Suất Theo Phần
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              {testResults.sectionResults.map((section: SectionResult) => (
                <SectionPerformance key={section.id} section={section} skill={currentTest.type} />
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
              Xem lại kết quả
            </Button>
          </div>
        </CardContent>
      </Card>

      {!!showReview && (
        <div className="mt-9">
          <TestReview
            test={currentTest}
            testResults={testResults}
            onBack={() => setShowReview(false)}
          />
        </div>
      )}
    </>
  );
}
