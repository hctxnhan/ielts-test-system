'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface NavigationButtonsProps {
  currentSectionIndex: number;
  totalSections: number;
  onPreviousSection: () => void;
  onNextSection: () => void;
  onCompleteTest: () => void;
}

export default function NavigationButtons({
  currentSectionIndex,
  totalSections,
  onPreviousSection,
  onNextSection,
  onCompleteTest
}: NavigationButtonsProps) {
  const isLastSection = currentSectionIndex === totalSections - 1;
  
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onPreviousSection}
        disabled={currentSectionIndex === 0}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Previous Section
      </Button>

      {isLastSection ? (
        <Button onClick={onCompleteTest}>
          <CheckCircle2 className="h-4 w-4 mr-2" /> Finish Test
        </Button>
      ) : (
        <Button onClick={onNextSection}>
          Next Section <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}