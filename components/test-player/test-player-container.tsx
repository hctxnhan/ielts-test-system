"use client";
import { processTestWithFilters, type TestFilterConfig } from "@testComponents/lib/test";
import type { Test } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import BaseTestContainer from "./base-test-container";
import TestInstructions from "./test-instructions";
import TestResults from "./test-results";

interface TestPlayerProps {
  test: Test;
  onBack?: () => void;
}

export default function TestPlayer({ test, onBack }: TestPlayerProps) {
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

  // Function to score all writing questions in the test
  const scoreAllWritingQuestions = async () => {
    if (!test || !progress) {
      return;
    }
   
    const getEssayScore = useTestStore.getState().scoreEssayFn;
    if (!getEssayScore) {
      console.warn("Debug: Essay scoring function is not available");
      return;
    }

   

    const currentAnswers = { ...progress.answers };
    let hasChanges = false;

    const processQuestion = async (question: any, answer: any) => {
      if (answer?.answer?.text && answer.answer.text.length < 100) {
        return {
          ...answer,
          score: 0,
          feedback: "Answer is too short.",
          answer: {
            ...answer.answer,
            score: 0,
            feedback: "Answer is too short.",
          },
        };
      } else if (!answer.score && !answer.feedback) {
        try {
          const response = await getEssayScore({
            prompt: question.text,
            essay: answer.answer.text,
            scoringPrompt: question.scoringPrompt || "",
          });

          console.log("===> response", response, question.text)
          console.log("===> essay", answer.answer.text)
          console.log("===> scoringPrompt", question.scoringPrompt)
          console.log("===> scoringPrompt", question)

          if (response.ok) {
            return {
              ...answer,
              score: (response.score * question.points) / 9,
              feedback: response.feedback,
              answer: {
                ...answer.answer,
                score: (response.score * question.points) / 9,
                feedback: response.feedback,
              },
            };
          } else {
            console.warn(
              "Debug: Scoring failed for question",
              question.id,
              "Response:",
              response
            );
          }
        } catch (error) {
          console.error(
            `Error scoring writing question ${question.id}:`,
            error
          );
        }
      }
      return answer;
    };

    for (const section of test.sections) {
      for (const question of section.questions) {
        const answer = currentAnswers[question.id];
        if (
          (question.type === "writing-task1" ||
            question.type === "writing-task2") &&
          answer?.answer?.text
        ) {
          const updatedAnswer = await processQuestion(question, answer);

          if (updatedAnswer !== answer) {
            currentAnswers[question.id] = updatedAnswer;
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      useTestStore.setState({
        progress: { ...progress, answers: currentAnswers },
      });
    } else {
    }
  };


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

        // Score all writing questions before completing the test
        await scoreAllWritingQuestions();

        await useTestStore.getState().submitTestResults(test.id);
        completeTest();
      } catch (error) {
        console.error("Error submitting test results:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [completeTest, test, scoreAllWritingQuestions]);

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
