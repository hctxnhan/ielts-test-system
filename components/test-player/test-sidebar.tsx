"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Test } from "@/lib/types";
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
  isSectionFullyAnswered: (index: number) => boolean;
  isSectionPartiallyAnswered: (index: number) => boolean;
}

export default function TestSidebar({
  test,
  progress,
  currentSectionIndex,
  onJumpToSection,
  onJumpToQuestion,
  onCompleteTest,
  isSectionFullyAnswered,
  isSectionPartiallyAnswered,
}: TestSidebarProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <TestTimer
          initialTime={progress.timeRemaining}
          onTimeEnd={onCompleteTest}
        />
        <Button variant="destructive" size="sm" onClick={onCompleteTest}>
          End Test
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
