"use client";

import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { ScrollArea } from "@testComponents/components/ui/scroll-area";
import type { Test } from "@testComponents/lib/types";
import SectionNavigationButton from "./section-navigation-button";
import TestTimer from "./test-timer";
interface TestSidebarProps {
  test: Test;
  progress: any;
  currentSectionIndex: number;
  onJumpToSection: (index: number) => void;
  onJumpToQuestion?: (
    sectionIndex: number,
    questionIndex: number,
    subQuestionIndex?: number,
  ) => void;
  onCompleteTest: () => void;
  isSubmitting: boolean;
  isReviewMode?: boolean;
}

export default function TestSidebar({
  test,
  progress,
  currentSectionIndex,
  onJumpToSection,
  onCompleteTest,
  isSubmitting,
  isReviewMode = false,
}: TestSidebarProps) {
  return (
    <>
      {!isReviewMode && (
        <div className="flex justify-between items-center mb-2 gap-1">
          <TestTimer
            initialTime={progress.timeRemaining}
            onTimeEnd={onCompleteTest}
          />
          <Button
            disabled={isSubmitting}
            variant="destructive"
            size="sm"
            className=""
            onClick={onCompleteTest}
          >
            {isSubmitting ? "Submitting..." : "Finish"}
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {test.sections.map((testSection, sectionIndex) => {
            const isCurrentSection = currentSectionIndex === sectionIndex;

            return (
              <div key={testSection.id} className="mb-1">
                <SectionNavigationButton
                  section={testSection}
                  sectionIndex={sectionIndex}
                  answers={progress.answers}
                  isCurrentSection={isCurrentSection}
                  onJumpToSection={onJumpToSection}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}
