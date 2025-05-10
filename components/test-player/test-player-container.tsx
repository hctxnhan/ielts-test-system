"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Test } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import BaseTestContainer from "./base-test-container";
import TestInstructions from "./test-instructions";
import TestResults from "./test-results";
import { updateQuestionIndexes } from "@testComponents/lib/test";

interface TestPlayerProps {
  test: Test;
  onBack?: () => void;
}

export default function TestPlayer({ test, onBack }: TestPlayerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const {
    loadTest,
    startTest,
    progress,
    currentSection,
    completeTest,
    resetTest,
    sectionResults,
  } = useTestStore();

  const showResults = progress?.completed && !!sectionResults;

  // Load the test when component mounts
  useEffect(() => {
    loadTest(test);

    return () => {
      // Clean up when component unmounts
      resetTest();
    };
  }, [test, loadTest, resetTest]);

  const updatedTest = useMemo(() => {
    return updateQuestionIndexes(test);
  }, [test]);

  const handleStartTest = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowInstructions(false);
    startTest();
  };

  // Handle test completion
  const handleCompleteTest = useCallback(async () => {
    // If we have a testId in the current test, try submitting the results
    if (test?.id) {
      try {
        setIsSubmitting(true);
        await useTestStore.getState().submitTestResults(test.id);
        completeTest();
      } catch (error) {
        console.error("Error submitting test results:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [completeTest, test]);

  // Navigation between sections
  const handleNextSection = useCallback(() => {
    if (!progress || !test) return;

    const isLastSection =
      progress.currentSectionIndex === test.sections.length - 1;
    if (isLastSection) {
      // End of test
      handleCompleteTest();
    } else {
      // Move to next section
      const updatedProgress = {
        ...progress,
        currentSectionIndex: progress.currentSectionIndex + 1,
        currentQuestionIndex: 0,
      };
      useTestStore.setState({ progress: updatedProgress });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [progress, test, handleCompleteTest]);

  const handlePreviousSection = useCallback(() => {
    if (!progress || !test) return;

    const isFirstSection = progress.currentSectionIndex === 0;
    if (isFirstSection) {
      // Already at the beginning of the test
      return;
    } else {
      // Move to previous section
      const updatedProgress = {
        ...progress,
        currentSectionIndex: progress.currentSectionIndex - 1,
        currentQuestionIndex: 0,
      };
      useTestStore.setState({ progress: updatedProgress });
    }
  }, [progress, test]);

  // If showing instructions
  if (showInstructions) {
    return (
      <TestInstructions
        onBack={onBack}
        test={updatedTest}
        onStart={handleStartTest}
      />
    );
  }

  // If test is completed, show results
  if (showResults && progress?.completed && sectionResults) {
    return (
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-4xl">
        <TestResults currentTest={updatedTest} testResults={sectionResults} />
      </div>
    );
  }

  return (
    <BaseTestContainer
      test={test}
      progress={progress}
      onBack={onBack}
      isSubmitting={isSubmitting}
      onCompleteTest={handleCompleteTest}
      onPreviousSection={handlePreviousSection}
      onNextSection={handleNextSection}
      currentSectionIndex={progress?.currentSectionIndex || 0}
      currentSection={currentSection()}
    />
  );
}
