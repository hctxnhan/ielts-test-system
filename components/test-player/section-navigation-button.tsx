'use client';

import { Button } from '@/components/ui/button';

interface SectionNavigationButtonProps {
  section: any;
  sectionIndex: number;
  isCurrentSection: boolean;
  isFullyAnswered: boolean;
  isPartiallyAnswered: boolean;
  onJumpToSection: (index: number) => void;
}

export default function SectionNavigationButton({
  section,
  sectionIndex,
  isCurrentSection,
  isFullyAnswered,
  isPartiallyAnswered,
  onJumpToSection
}: SectionNavigationButtonProps) {
  return (
    <Button
      onClick={() => onJumpToSection(sectionIndex)}
      variant={isCurrentSection ? "default" : "outline"}
      className={`w-full mb-2 ${isFullyAnswered
        ? 'border-green-500 bg-green-50 hover:bg-green-100 text-green-800'
        : isPartiallyAnswered
          ? 'border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-800'
          : ''
        }`}
    >
      {section.title}
      <div className="ml-2 text-xs">
        {section.questions.length} questions
      </div>
    </Button>
  );
}