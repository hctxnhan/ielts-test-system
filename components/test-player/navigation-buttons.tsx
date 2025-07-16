"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@testComponents/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@testComponents/components/ui/dialog";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isLastSection = currentSectionIndex === totalSections - 1;

  const handleConfirmFinish = () => {
    setShowConfirmModal(false);
    onCompleteTest();
  };

  const nextButton = (() => {
    if (isLastSection && !readOnly) {
      return (
        <Button
          size="sm"
          onClick={() => setShowConfirmModal(true)}
          disabled={isSubmitting}
        >
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
    <>
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

      {hasMounted && (
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Finish Test</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to finish and submit the test?
            </p>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmFinish} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm Finish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
