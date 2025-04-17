"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Test } from "@/lib/types";
import { useTestStore } from "@/store/test-store";
import { LayoutGrid, SplitSquareVertical, GripVertical } from "lucide-react";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AudioPlayer from "./audio-player";
import NavigationButtons from "./navigation-buttons";
import ReadingPassageViewer from "./reading-passage-viewer";
import SectionQuestionsRenderer from "./section-questions-renderer";
import TestInstructions from "./test-instructions";
import TestResults from "./test-results";
import TestSidebar from "./test-sidebar";
import { updateQuestionIndexes } from "@/lib/test";

interface TestPlayerProps {
  test: Test;
  loading: boolean;
  onBack?: () => void;
  onTestComplete?: () => Promise<void>;
}

export default function TestPlayer({
  test,
  loading,
  onBack,
  onTestComplete,
}: TestPlayerProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPassage, setShowPassage] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const resizingRef = useRef(false);
  const passageContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const updatedTest = useMemo(() => {
    return updateQuestionIndexes(test);
  }, [test]);

  const {
    loadTest,
    startTest,
    progress,
    nextQuestion,
    previousQuestion,
    currentSection,
    isLastQuestion,
    completeTest,
    resetTest,
  } = useTestStore();

  // Load the test when component mounts
  useEffect(() => {
    if (loading) return;

    loadTest(updatedTest);

    return () => {
      // Clean up when component unmounts
      resetTest();
    };
  }, [updatedTest, loadTest, resetTest, loading]);

  // Start the test when instructions are dismissed
  const handleStartTest = useCallback(() => {
    setShowInstructions(false);
    startTest();
  }, [startTest]);

  // Handle test completion
  const handleCompleteTest = useCallback(async () => {
    await onTestComplete?.();
    completeTest();
  }, [completeTest, onTestComplete]);

  // Toggle reading passage visibility
  const togglePassage = useCallback(() => {
    setShowPassage((prev) => !prev);
  }, []);

  // Navigation between sections
  const handleNextSection = useCallback(() => {
    if (!progress || !updatedTest) return;

    const isLastSection =
      progress.currentSectionIndex === updatedTest.sections.length - 1;
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
    }
    setSidebarOpen(false);
  }, [progress, updatedTest, handleCompleteTest]);

  const handlePreviousSection = useCallback(() => {
    if (!progress || !updatedTest) return;

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
    setSidebarOpen(false);
  }, [progress, updatedTest]);

  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    setAudioPlayed(true);
  }, []);

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
      setSidebarOpen(false);
    },
    [progress]
  );

  // Jump to specific question (and optionally a specific sub-question)
  const jumpToQuestion = useCallback(
    (
      sectionIndex: number,
      questionIndex: number,
      subQuestionIndex?: number
    ) => {
      if (!progress || !updatedTest) return;

      // Update the test state to show the selected question
      const updatedProgress = {
        ...progress,
        currentSectionIndex: sectionIndex,
        currentQuestionIndex: questionIndex,
      };

      useTestStore.setState({ progress: updatedProgress });
      setSidebarOpen(false);

      // After state update, scroll to the specific sub-question if provided
      if (subQuestionIndex !== undefined) {
        // Use setTimeout to ensure the DOM has updated
        setTimeout(() => {
          const subQuestionElement = document.getElementById(
            `question-${subQuestionIndex}`
          );
          if (subQuestionElement) {
            subQuestionElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    },
    [progress, updatedTest]
  );

  // Check if a section has been fully answered
  const isSectionFullyAnswered = useCallback(
    (sectionIndex: number) => {
      if (!progress || !updatedTest) return false;

      const section = updatedTest.sections[sectionIndex];
      const sectionQuestionIds = section.questions.map((q) => q.id);

      return sectionQuestionIds.every(
        (id) => progress.answers[id] !== undefined
      );
    },
    [progress, updatedTest]
  );

  // Check if a section has been partially answered
  const isSectionPartiallyAnswered = useCallback(
    (sectionIndex: number) => {
      if (!progress || !updatedTest) return false;

      const section = updatedTest.sections[sectionIndex];
      const sectionQuestionIds = section.questions.map((q) => q.id);

      const answeredCount = sectionQuestionIds.filter(
        (id) => progress.answers[id] !== undefined
      ).length;

      return answeredCount > 0 && answeredCount < sectionQuestionIds.length;
    },
    [progress, updatedTest]
  );

  // If test is not loaded yet, show loading
  if (!updatedTest) {
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
        loading={loading}
        onBack={onBack}
        test={updatedTest}
        onStart={handleStartTest}
      />
    );
  }

  // If test is completed, show results
  if (progress?.completed) {
    return <TestResults />;
  }

  // Get current section
  const section = currentSection();

  if (!progress || !section) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Error loading test content.</p>
      </div>
    );
  }

  const isReadingTest = updatedTest.type === "reading";
  const isListeningTest = updatedTest.type === "listening";

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* Floating button for mobile */}
        <div className="fixed bottom-4 left-4 z-50 lg:hidden">
          <Button
            onClick={() => setSidebarOpen(true)}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile sidebar as a sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md p-4 flex flex-col"
          >
            <SheetHeader className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <SheetTitle>Test Navigation</SheetTitle>
              </div>
            </SheetHeader>
            <div className="flex flex-col flex-1 mt-4">
              <TestSidebar
                test={updatedTest}
                progress={progress}
                currentSectionIndex={progress.currentSectionIndex}
                onJumpToSection={jumpToSection}
                onJumpToQuestion={jumpToQuestion}
                onCompleteTest={handleCompleteTest}
                isSectionFullyAnswered={isSectionFullyAnswered}
                isSectionPartiallyAnswered={isSectionPartiallyAnswered}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{updatedTest.title}</h1>
        </div>

        {isListeningTest && section.audioUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Listening Section</h2>
            <AudioPlayer src={section.audioUrl} onEnded={handleAudioEnded} />
            {!audioPlayed && (
              <Alert className="mt-2">
                <AlertDescription>
                  In a real IELTS test, you would only hear the recording once.
                  Listen carefully.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div
          ref={contentContainerRef}
          className="flex flex-col lg:flex-row gap-6 relative"
        >
          {/* Reading Passage - Full width on mobile, conditionally shown column on desktop with sticky top */}
          {isReadingTest && section.readingPassage && (
            <div
              ref={passageContainerRef}
              className={`lg:transition-all lg:duration-300 ${
                showPassage
                  ? "lg:w-1/3 opacity-100"
                  : "lg:w-0 lg:opacity-0 lg:overflow-hidden"
              }`}
            >
              <div className="sticky top-20 z-20 h-[calc(100vh-65px-2rem)]">
                <Card className="shadow-sm overflow-hidden h-full">
                  <ScrollArea className="h-[calc(100vh-65px-2rem)]">
                    <CardContent className="p-4">
                      <ReadingPassageViewer
                        passage={section.readingPassage}
                        containerRef={passageContainerRef}
                      />
                    </CardContent>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          )}

          {/* Questions - Full width on mobile, expanded when passage is hidden */}
          <div className={`lg:transition-all lg:duration-300 flex-1`}>
            {/* Toggle passage button - moved from passage section to questions section */}
            {isReadingTest && section.readingPassage && (
              <div className="justify-start mb-4  lg:flex hidden">
                <Button variant="outline" size="sm" onClick={togglePassage}>
                  {showPassage ? "Hide Passage" : "Show Passage"}
                  <SplitSquareVertical className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <SectionQuestionsRenderer
                questions={section.questions}
                sectionId={section.id}
              />

              <NavigationButtons
                currentSectionIndex={progress.currentSectionIndex}
                totalSections={updatedTest.sections.length}
                onPreviousSection={handlePreviousSection}
                onNextSection={handleNextSection}
                onCompleteTest={handleCompleteTest}
              />
            </div>
          </div>

          {/* Sidebar - hidden on mobile, last column on desktop */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-20 z-20">
              <Card className="shadow-sm p-3 flex flex-col h-[calc(100vh-65px-2rem)]">
                <TestSidebar
                  test={updatedTest}
                  progress={progress}
                  currentSectionIndex={progress.currentSectionIndex}
                  onJumpToSection={jumpToSection}
                  onCompleteTest={handleCompleteTest}
                  isSectionFullyAnswered={isSectionFullyAnswered}
                  isSectionPartiallyAnswered={isSectionPartiallyAnswered}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
