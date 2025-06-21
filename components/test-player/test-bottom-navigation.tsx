"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@testComponents/components/ui/button";
import type { Test, TestProgress, UserAnswer } from "@testComponents/lib/types";
import NavigationButtons from "./navigation-buttons";
import TestTimer from "./test-timer";
import TimeUpDialog from "./time-up-dialog";
import { getSectionStats } from "@testComponents/lib/test-utils";

interface TestBottomNavigationProps {
  test: Test;
  progress: TestProgress | null;
  currentSectionIndex: number;
  currentSection: {
    id: string;
    title: string;
    questions: { id: string }[];
  };
  readOnly?: boolean;
  isSubmitting?: boolean;
  onPreviousSection: () => void;
  onNextSection: () => void;
  onCompleteTest: () => void;
  jumpToSection: (index: number) => void;
  answers?: Record<string, UserAnswer>;
}

export default function TestBottomNavigation({
  test,
  progress,
  currentSectionIndex,
  currentSection,
  readOnly = false,
  isSubmitting = false,
  onPreviousSection,
  onNextSection,
  onCompleteTest,
  jumpToSection,
  answers = {},
}: TestBottomNavigationProps) {
  const [isTimeUpDialogOpen, setIsTimeUpDialogOpen] = useState(false);

  const handleTimeEnd = useCallback(() => {
    setIsTimeUpDialogOpen(true);
  }, []);

  const handleSubmitTest = () => {
    setIsTimeUpDialogOpen(false);
    onCompleteTest();
  };

  if (readOnly || !progress) {
    return null;
  }

  return (
    <>
      {/* Floating Timer */}
      <TestTimer initialTime={test.totalDuration} onTimeEnd={handleTimeEnd} />

      {/* Time Up Dialog */}
      <TimeUpDialog
        isOpen={isTimeUpDialogOpen}
        onSubmitTest={handleSubmitTest}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t shadow-lg">
        <div className="flex items-center justify-between p-4">
          {/* Section Navigation */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">
                {currentSection.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {progress.answers
                  ? Object.keys(progress.answers).filter((key) =>
                      currentSection.questions.some(
                        (q: { id: string }) => q.id === key
                      )
                    ).length
                  : 0}{" "}
                / {currentSection.questions.length}
              </span>
            </div>
          </div>

          {/* Section Pills */}
          <div className="flex items-center space-x-2 flex-1 justify-center">
            {test.sections.map((section, index) => {
              // Calculate question count and completion status
              const firstQuestion = section.questions[0];
              const lastQuestion = section.questions.at(-1);
              const startIndex = firstQuestion.index || 0;
              const endIndex =
                lastQuestion?.partialEndingIndex || lastQuestion?.index || 0;

              const questionCount = endIndex - startIndex + 1;
              const sectionStatus = getSectionStats(section, answers);

              // Count answered questions
              const answeredQuestionsCount =
                sectionStatus.sectionAnswers.length;
              const isComplete = answeredQuestionsCount === questionCount;
              const isCurrent = index === currentSectionIndex;

              return (
                <Button
                  key={section.id}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => jumpToSection(index)}
                  className={`px-3 py-1 text-xs ${
                    isComplete
                      ? "bg-green-100 border-green-300 text-green-800"
                      : ""
                  }`}
                >
                  Part {index + 1}
                  <span className="ml-1 text-xs">
                    {answeredQuestionsCount} / {questionCount}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <NavigationButtons
              readOnly={readOnly}
              isSubmitting={isSubmitting}
              currentSectionIndex={currentSectionIndex}
              totalSections={test.sections.length}
              onPreviousSection={onPreviousSection}
              onNextSection={onNextSection}
              onCompleteTest={onCompleteTest}
            />
          </div>
        </div>
      </div>
    </>
  );
}
