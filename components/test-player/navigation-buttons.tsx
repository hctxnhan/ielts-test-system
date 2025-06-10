"use client";
import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface NavigationButtonsProps {
  currentSectionIndex: number;
  totalSections: number;
  onPreviousSection: () => void;
  onNextSection: () => void;
  onCompleteTest: () => void;
  isSubmitting: boolean;
  readOnly: boolean;
}

export default function NavigationButtons({
  currentSectionIndex,
  totalSections,
  onPreviousSection,
  onNextSection,
  onCompleteTest,
  isSubmitting,
  readOnly,
}: NavigationButtonsProps) {
  const isLastSection = currentSectionIndex === totalSections - 1;
  const nextButton = (() => {
    if (isLastSection && !readOnly) {
      return (
        <Button size="sm" onClick={onCompleteTest} disabled={isSubmitting}>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {isSubmitting ? "Submitting..." : "Finish Test"}
        </Button>
      );
    } else if (isLastSection && readOnly) {
      return (
        <Button size="sm" disabled={true}>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Next
        </Button>
      );
    } else {
      return (
        <Button size="sm" onClick={onNextSection}>
          Next <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      );
    }
  })();

  return (
    <div className="flex gap-2 justify-between">
      <Button
        size="sm"
        variant="outline"
        onClick={onPreviousSection}
        disabled={currentSectionIndex === 0}
      >
        <ArrowLeft className="h-3 w-3 mr-1" /> Previous
      </Button>

      {nextButton}
    </div>
  );
}
