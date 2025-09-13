"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Button } from "@testComponents/components/ui/button";
import type { Test, TestProgress, UserAnswer } from "@testComponents/lib/types";
import NavigationButtons from "./navigation-buttons";
import TestTimer from "./test-timer";
import TimeUpDialog from "./time-up-dialog";
import { getSectionStats } from "@testComponents/lib/test-utils";

interface SectionStatsCache {
  [sectionId: string]: {
    sectionAnswers: UserAnswer[];
    sectionScore: number;
    sectionTotalScore: number;
    sectionPercentage: number;
    sectionTotalQuestions: number;
    sectionUnansweredQuestions: number;
    sectionCorrectAnswers: number;
    sectionIncorrectAnswers: number;
  };
}

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
  const [sectionStatsCache, setSectionStatsCache] = useState<SectionStatsCache>({});

  // Update section stats when answers change
  useEffect(() => {
    const updateSectionStats = () => {
      const newCache: SectionStatsCache = {};
      
      for (const section of test.sections) {
        try {
          const stats = getSectionStats(section, answers);
          newCache[section.id] = stats;
        } catch (error) {
          console.error(`Failed to calculate stats for section ${section.id}:`, error);
          // Provide fallback values
          newCache[section.id] = {
            sectionAnswers: [],
            sectionScore: 0,
            sectionTotalScore: 0,
            sectionPercentage: 0,
            sectionTotalQuestions: 0,
            sectionUnansweredQuestions: 0,
            sectionCorrectAnswers: 0,
            sectionIncorrectAnswers: 0,
          };
        }
      }
      
      setSectionStatsCache(newCache);
    };

    updateSectionStats();
  }, [test.sections, answers]);

  const handleTimeEnd = useCallback(() => {
    setIsTimeUpDialogOpen(true);
  }, []);

  const handleSubmitTest = () => {
    setIsTimeUpDialogOpen(false);
    onCompleteTest();
  };

  if (!progress) {
    return null;
  }

  return (
    <>
      {/* Floating Timer - Only show in non-readonly mode */}
      {!readOnly && (
        <TestTimer initialTime={test.totalDuration} onTimeEnd={handleTimeEnd} />
      )}

      {/* Time Up Dialog - Only show in non-readonly mode */}
      {!readOnly && (
        <TimeUpDialog
          isOpen={isTimeUpDialogOpen}
          onSubmitTest={handleSubmitTest}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t shadow-lg">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="p-3 space-y-2">
            {/* Current Section Info */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate">
                {currentSection.title}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {(() => {
                  const fullSection = test.sections[currentSectionIndex];
                  const sectionStats = sectionStatsCache[fullSection.id];
                  return sectionStats ? sectionStats.sectionAnswers.length : 0;
                })()} / {currentSection.questions.length}
              </span>
            </div>

            {/* Section Pills - Compact */}
            <div className="flex items-center justify-center space-x-1 overflow-x-auto pb-1">
              {/* Previous Button - Icon Only */}
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousSection}
                disabled={currentSectionIndex === 0 || readOnly}
                className="px-2 py-1 shrink-0"
              >
                ←
              </Button>

              {test.sections.map((section, index) => {
                const firstQuestion = section.questions[0];
                const lastQuestion = section.questions.at(-1);
                const startIndex = firstQuestion.index || 0;
                const endIndex =
                  lastQuestion?.partialEndingIndex || lastQuestion?.index || 0;
                const questionCount = endIndex - startIndex + 1;
                const sectionStats = sectionStatsCache[section.id];
                const answeredQuestionsCount = sectionStats ? sectionStats.sectionAnswers.length : 0;
                const isComplete = answeredQuestionsCount === questionCount;
                const isCurrent = index === currentSectionIndex;

                return (
                  <Button
                    key={section.id}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    onClick={() => jumpToSection(index)}
                    className={`px-2 py-1 text-xs shrink-0 min-w-[50px] ${
                      isComplete
                        ? "bg-green-100 border-green-300 text-green-800"
                        : ""
                    }`}
                  >
                    P{index + 1}
                    <span className="ml-1 text-xs">
                      {answeredQuestionsCount}/{questionCount}
                    </span>
                  </Button>
                );
              })}

              {/* Next/Complete Button - Icon Only */}
              {currentSectionIndex === test.sections.length - 1 ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onCompleteTest}
                  disabled={isSubmitting || readOnly}
                  className="px-2 py-1 shrink-0 bg-green-600 hover:bg-green-700"
                >
                  ✓
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextSection}
                  disabled={readOnly}
                  className="px-2 py-1 shrink-0"
                >
                  →
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between p-4">
            {/* Section Navigation */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {currentSection.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(() => {
                    const fullSection = test.sections[currentSectionIndex];
                    const sectionStats = sectionStatsCache[fullSection.id];
                    return sectionStats ? sectionStats.sectionAnswers.length : 0;
                  })()} / {currentSection.questions.length}
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
                const sectionStats = sectionStatsCache[section.id];

                // Count answered questions
                const answeredQuestionsCount = sectionStats ? sectionStats.sectionAnswers.length : 0;
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
      </div>
    </>
  );
}
