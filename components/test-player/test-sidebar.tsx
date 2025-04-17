"use client";

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
    subQuestionIndex?: number
  ) => void;
  onCompleteTest: () => void;
  isSubmitting: boolean;
}

export default function TestSidebar({
  test,
  progress,
  currentSectionIndex,
  onJumpToSection,
  onJumpToQuestion,
  onCompleteTest,
  isSubmitting,
}: TestSidebarProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <TestTimer
          initialTime={progress.timeRemaining}
          onTimeEnd={onCompleteTest}
        />
        <Button
          disabled={isSubmitting}
          variant="destructive"
          size="sm"
          onClick={onCompleteTest}
        >
          {isSubmitting ? "Submitting..." : "Finish Test"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {test.sections.map((testSection, sectionIndex) => {
          const isCurrentSection = currentSectionIndex === sectionIndex;

          return (
            <div key={testSection.id} className="mb-6">
              <div className="mb-3">
                <h3 className="text-sm font-medium">
                  Section {sectionIndex + 1}
                </h3>
              </div>

              <SectionNavigationButton
                section={testSection}
                sectionIndex={sectionIndex}
                answers={progress.answers}
                isCurrentSection={isCurrentSection}
                onJumpToSection={onJumpToSection}
                onJumpToQuestion={onJumpToQuestion}
              />
            </div>
          );
        })}
      </ScrollArea>
    </>
  );
}
