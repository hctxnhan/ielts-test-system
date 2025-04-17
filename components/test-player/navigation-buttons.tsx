"use client";

import { Button } from "@testComponents/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface NavigationButtonsProps {
  currentSectionIndex: number;
  totalSections: number;
  onPreviousSection: () => void;
  onNextSection: () => void;
  onCompleteTest: () => void;
  isSubmitting: boolean;
}

export default function NavigationButtons({
  currentSectionIndex,
  totalSections,
  onPreviousSection,
  onNextSection,
  onCompleteTest,
  isSubmitting,
}: NavigationButtonsProps) {
  const isLastSection = currentSectionIndex === totalSections - 1;

  return (
    <div className="flex justify-between mt-4">
      <Button
        size="sm"
        variant="outline"
        onClick={onPreviousSection}
        disabled={currentSectionIndex === 0}
      >
        <ArrowLeft className="h-3 w-3 mr-1" /> Previous
      </Button>

      {isLastSection ? (
        <Button size="sm" onClick={onCompleteTest} disabled={isSubmitting}>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {isSubmitting ? "Submitting..." : "Finish Test"}
        </Button>
      ) : (
        <Button size="sm" onClick={onNextSection}>
          Next <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}
