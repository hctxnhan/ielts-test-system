"use client";
import React from 'react';
import { processTestWithFilters } from "@testComponents/lib/test";
import type { Test } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { useCallback, useEffect, useState } from "react";
import BaseTestContainer from "./base-test-container";
import TestInstructions from "./test-instructions";
import TestResults from "./test-results";

interface TestPlayerProps {
  test: Test;
  onBack?: () => void;
  params?: {
    id: string
  }
}

export default function TestPlayer({ params, test, onBack }: TestPlayerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const {
    currentTest,
    loadTest,
    startTest,
    progress,
    completeTest,
    sectionResults,
    realTestMode,
    resetTest,
  } = useTestStore();

  // Load the test when component mounts (for instructions display)
  useEffect(() => {
    if (test && !currentTest) {
      loadTest(test);
    }
  }, [test, currentTest, loadTest]);

  // Reset the store when component unmounts
  useEffect(() => {
    return () => {
      resetTest();
    };
  }, [resetTest]);

  const showResults = progress?.completed && !!sectionResults;


  const handleStartTest = (
    customMode?: boolean,
    selectedSections?: string[],
    selectedTypes?: string[],
    realTestMode?: boolean
  ) => {
    // Process the test with filters using the utility function
    const processedTest = processTestWithFilters(test, {
      customMode,
      selectedSections,
      selectedTypes,
    });

    loadTest(processedTest, {
      customMode: customMode,
      selectedSections: selectedSections || [],
      selectedTypes: selectedTypes || [],
      realTestMode: realTestMode,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowInstructions(false);
    startTest();
  };

  // Handle test completion
  const handleCompleteTest = useCallback(async () => {
    if (test?.id) {
      try {
        setIsSubmitting(true);

        // Complete test (this will score scoreOnSubmit questions like sentence-translation)
        await completeTest();

        // Submit results after all scoring is complete
        //handle exercise type 
        if (test.isExercise) {
          if (!params) {
            console.error("Error during test completion:", `Class ID not found ${test.isExercise}`);
            return
          }
          console.log("==> params.id", params.id)
          await useTestStore.getState().submitTestResults(test.id, Number(params.id));
        } else await useTestStore.getState().submitTestResults(test.id);
      } catch (error) {
        console.error("Error during test completion:", error);
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

  // Jump to specific section
  const jumpToSection = useCallback(
    (sectionIndex: number) => {
      if (!progress) return;

      const updatedProgress = {
        ...progress,
        currentSectionIndex: sectionIndex,
        currentQuestionIndex: 0,
      };

      useTestStore.setState({ progress: updatedProgress });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [progress]
  );

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

  // Show loading only if we don't have the current test loaded
  if (!currentTest) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading test...</p>
      </div>
    );
  }

  // If showing instructions
  if (showInstructions) {
    return (
      <TestInstructions
        onBack={onBack}
        test={currentTest}
        onStart={handleStartTest}
      />
    );
  }

  // If test is completed, show results
  if (showResults && progress?.completed && sectionResults) {
    return (
      <div className="mx-auto p-4">
        <TestResults currentTest={currentTest} testResults={sectionResults} />
      </div>
    );
  }

  // For the actual test running, we need both currentTest and progress
  if (!progress) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Starting test...</p>
      </div>
    );
  }

  return (
    <BaseTestContainer
      test={currentTest}
      progress={progress}
      onBack={onBack}
      isSubmitting={isSubmitting}
      onCompleteTest={handleCompleteTest}
      onPreviousSection={handlePreviousSection}
      onNextSection={handleNextSection}
      currentSectionIndex={progress?.currentSectionIndex || 0}
      jumpToSection={jumpToSection}
      realTestMode={realTestMode}
    />
  );
}
