"use client";
import React, { useState } from "react";
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

  const handleNextSection = () => {
    if (currentSectionIndex < test.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const jumpToSection = (index: number) => {
    if (index >= 0 && index < test.sections.length) {
      setCurrentSectionIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
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
  );
}
