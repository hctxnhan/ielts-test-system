'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Test } from '@/lib/types';
import SectionNavigationButton from './section-navigation-button';
import TestTimer from './test-timer';

interface TestSidebarProps {
  test: Test;
  progress: any;
  currentSectionIndex: number;
  onJumpToSection: (index: number) => void;
  onCompleteTest: () => void;
  isSectionFullyAnswered: (index: number) => boolean;
  isSectionPartiallyAnswered: (index: number) => boolean;
}

export default function TestSidebar({
  test,
  progress,
  currentSectionIndex,
  onJumpToSection,
  onCompleteTest,
  isSectionFullyAnswered,
  isSectionPartiallyAnswered
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
          const isFullyAnswered = isSectionFullyAnswered(sectionIndex);
          const isPartiallyAnswered = isSectionPartiallyAnswered(sectionIndex);

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
                isCurrentSection={isCurrentSection}
                isFullyAnswered={isFullyAnswered}
                isPartiallyAnswered={isPartiallyAnswered}
                onJumpToSection={onJumpToSection}
              />
            </div>
          );
        })}
      </ScrollArea>
    </>
  );
}