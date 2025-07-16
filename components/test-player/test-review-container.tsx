"use client";
import React, { useRef, useState } from "react";
import type { Test, TestProgress, TestResult } from "@testComponents/lib/types";
import BaseTestContainer from "./base-test-container";

interface TestReviewProps {
  test: Test;
  testResults: TestResult;
  onBack?: () => void;
}

export default function TestReview({
  test,
  testResults,
  onBack
}: TestReviewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
<<<<<<< HEAD
=======
  const containerRef = useRef<HTMLDivElement>(null);
>>>>>>> bd24419d182ac0d6c4a1002a1c036f1ff5a59267

  // Create a simulated progress object for review mode
  const progress: TestProgress = {
    testId: test.id?.toString() || '',
    currentSectionIndex,
    currentQuestionIndex: 0,
    timeRemaining: 0,
    answers: testResults.answers || {},
    completed: true,
    startedAt: testResults.startedAt,
    completedAt: testResults.completedAt
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < test.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      scrollToTop();
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      scrollToTop();
    }
  };

  const jumpToSection = (index: number) => {
    if (index >= 0 && index < test.sections.length) {
      setCurrentSectionIndex(index);
      scrollToTop();
    }
  };

  return (
<<<<<<< HEAD
    <BaseTestContainer
      test={test}
      progress={progress}
      onBack={onBack}
      onCompleteTest={() => {}}
      onPreviousSection={handlePreviousSection}
      onNextSection={handleNextSection}
      currentSectionIndex={currentSectionIndex}
      readOnly={true}
      jumpToSection={jumpToSection}
    />
=======
    <div ref={containerRef}>
      <BaseTestContainer
        test={test}
        progress={progress}
        onBack={onBack}
        onCompleteTest={() => {}}
        onPreviousSection={handlePreviousSection}
        onNextSection={handleNextSection}
        currentSectionIndex={currentSectionIndex}
        readOnly={true}
        jumpToSection={jumpToSection}
      />
    </div>
>>>>>>> bd24419d182ac0d6c4a1002a1c036f1ff5a59267
  );
}
