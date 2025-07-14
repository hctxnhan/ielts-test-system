"use client";

import React from "react";
import { Alert, AlertDescription } from "@testComponents/components/ui/alert";
import { Button } from "@testComponents/components/ui/button";
import { Card, CardContent } from "@testComponents/components/ui/card";
import { ScrollArea } from "@testComponents/components/ui/scroll-area";
import type { Test, TestProgress } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { SplitSquareVertical } from "lucide-react";
import { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AudioPlayer from "./audio-player";
import ReadingPassageViewer from "./reading-passage-viewer";
import SectionQuestionsRenderer from "./section-questions-renderer";
import TestBottomNavigation from "./test-bottom-navigation";

export interface BaseTestContainerProps {
  test: Test;
  progress: TestProgress | null;
  onBack?: () => void;
  isSubmitting?: boolean;
  onCompleteTest: () => void;
  onPreviousSection: () => void;
  onNextSection: () => void;
  currentSectionIndex: number; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readOnly?: boolean;
  jumpToSection: (index: number) => void;
  realTestMode?: boolean;
}

export default function BaseTestContainer({
  test,
  progress,
  onBack,
  isSubmitting = false,
  onCompleteTest,
  onPreviousSection,
  onNextSection,
  currentSectionIndex,
  readOnly = false,
  jumpToSection,
  realTestMode = false,
}: BaseTestContainerProps) {
  const [showPassage, setShowPassage] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const passageContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const {
    updatePassageContent,
    updateQuestionContent,
    currentSection: getCurrentSection,
  } = useTestStore();

  const currentSection = test.sections[currentSectionIndex];

  const togglePassage = () => {
    setShowPassage((prev) => !prev);
  };

  const handleAudioEnded = () => {
    setAudioPlayed(true);
  };

  if (!progress || !currentSection) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Error loading test content.</p>
      </div>
    );
  }

  // If test is not loaded yet, show loading
  if (!test) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading test...</p>
      </div>
    );
  }

  const isReadingTest = test.type === "reading" || test.skill === "reading";
  const isListeningTest =
    test.type === "listening" || test.skill === "listening";
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="pb-10">
        {/* Add bottom padding for fixed navigation */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{test.title}</h1>
        </div>

        {isListeningTest && test.audioUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Listening Section</h2>
            <AudioPlayer
              src={test.audioUrl}
              onEnded={handleAudioEnded}
              realTestMode={realTestMode}
            />
            {!audioPlayed && !readOnly && (
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
          {isReadingTest && currentSection.readingPassage && (
            <div
              ref={passageContainerRef}
              className={`lg:transition-all lg:duration-300 ${
                showPassage
                  ? "lg:w-1/2 min-w-[400px] opacity-100"
                  : "lg:w-0 lg:opacity-0 lg:overflow-hidden"
              }`}
            >
              <div className="sticky top-20 z-20 h-[calc(100vh-65px-85px-2rem)]">
                <Card className="shadow-sm overflow-hidden h-full">
                  <ScrollArea className="h-full">
                    {" "}
                    <CardContent className="p-4">
                      <ReadingPassageViewer
                        passage={currentSection.readingPassage}
                        containerRef={passageContainerRef}
                        onContentChange={(content) => {
                          updatePassageContent(currentSection.id, content);
                        }}
                      />
                    </CardContent>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          )}{" "}
          {/* Questions - Full width on mobile, expanded when passage is hidden */}
          <div className={`lg:transition-all lg:duration-300 flex-1`}>
            {/* Toggle passage button - moved from passage section to questions section */}
            {isReadingTest && currentSection.readingPassage && (
              <div className="justify-start mb-4  lg:flex hidden">
                <Button variant="outline" size="sm" onClick={togglePassage}>
                  {showPassage ? "Hide Passage" : "Show Passage"}
                  <SplitSquareVertical className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-4 mx-auto">
              <SectionQuestionsRenderer
                questions={currentSection.questions}
                sectionId={currentSection.id}
                isReviewMode={readOnly}
                answers={progress.answers}
                onQuestionContentChange={
                  readOnly ? undefined : updateQuestionContent
                }
              />
            </div>
          </div>{" "}
        </div>

        {/* Fixed Bottom Navigation Bar */}
        <TestBottomNavigation
          test={test}
          progress={progress}
          currentSectionIndex={currentSectionIndex}
          currentSection={currentSection}
          readOnly={readOnly}
          isSubmitting={isSubmitting}
          onPreviousSection={onPreviousSection}
          onNextSection={onNextSection}
          onCompleteTest={onCompleteTest}
          jumpToSection={jumpToSection}
          answers={progress.answers}
        />
      </div>
    </DndProvider>
  );
}
