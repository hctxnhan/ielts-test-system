"use client";

import React from "react";
import { Alert, AlertDescription } from "@testComponents/components/ui/alert";
import { Button } from "@testComponents/components/ui/button";
import { Card, CardContent } from "@testComponents/components/ui/card";
import { ScrollArea } from "@testComponents/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@testComponents/components/ui/sheet";
import type { Test, TestProgress } from "@testComponents/lib/types";
import { LayoutGrid, SplitSquareVertical } from "lucide-react";
import { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AudioPlayer from "./audio-player";
import NavigationButtons from "./navigation-buttons";
import ReadingPassageViewer from "./reading-passage-viewer";
import SectionQuestionsRenderer from "./section-questions-renderer";
import TestSidebar from "./test-sidebar";

export interface BaseTestContainerProps {
  test: Test;
  progress: TestProgress | null;
  onBack?: () => void;
  isSubmitting?: boolean;
  onCompleteTest: () => void;
  onPreviousSection: () => void;
  onNextSection: () => void;
  currentSectionIndex: number;
  currentSection: any;
  readOnly?: boolean;
  jumpToSection: (index: number) => void;
}

export default function BaseTestContainer({
  test,
  progress,
  isSubmitting = false,
  onCompleteTest,
  onPreviousSection,
  onNextSection,
  currentSectionIndex,
  currentSection,
  readOnly = false,
  jumpToSection,
}: BaseTestContainerProps) {
  const [showPassage, setShowPassage] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const passageContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

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

  const isReadingTest = test.type === "reading";
  const isListeningTest = test.type === "listening";

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
              <div className="flex flex-col flex-1 mt-4">
                <TestSidebar
                  isSubmitting={isSubmitting}
                  test={test}
                  progress={progress}
                  currentSectionIndex={progress.currentSectionIndex}
                  onJumpToSection={jumpToSection}
                  onCompleteTest={onCompleteTest}
                  isReviewMode={readOnly}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{test.title}</h1>
        </div>

        {isListeningTest && currentSection.audioUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Listening Section</h2>
            <AudioPlayer
              src={currentSection.audioUrl}
              onEnded={handleAudioEnded}
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
                  ? "lg:w-1/3 opacity-100"
                  : "lg:w-0 lg:opacity-0 lg:overflow-hidden"
              }`}
            >
              <div className="sticky top-0 z-20 h-[calc(100vh-65px-2rem)]">
                <Card className="shadow-sm overflow-hidden h-full">
                  <ScrollArea className="h-[calc(100vh-65px-2rem)]">
                    <CardContent className="p-4">
                      <ReadingPassageViewer
                        passage={currentSection.readingPassage}
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
            {isReadingTest && currentSection.readingPassage && (
              <div className="justify-start mb-4  lg:flex hidden">
                <Button variant="outline" size="sm" onClick={togglePassage}>
                  {showPassage ? "Hide Passage" : "Show Passage"}
                  <SplitSquareVertical className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <SectionQuestionsRenderer
                questions={currentSection.questions}
                sectionId={currentSection.id}
                isReviewMode={readOnly}
              />

              {!readOnly && (
                <NavigationButtons
                  isSubmitting={isSubmitting}
                  currentSectionIndex={currentSectionIndex}
                  totalSections={test.sections.length}
                  onPreviousSection={onPreviousSection}
                  onNextSection={onNextSection}
                  onCompleteTest={onCompleteTest}
                />
              )}
            </div>
          </div>
          {/* Sidebar - hidden on mobile, last column on desktop */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-20 z-20">
              <Card className="shadow-sm p-3 flex flex-col h-[calc(100vh-65px-2rem)]">
                <TestSidebar
                  isReviewMode={readOnly}
                  isSubmitting={isSubmitting}
                  test={test}
                  progress={progress}
                  currentSectionIndex={progress.currentSectionIndex}
                  onJumpToSection={jumpToSection}
                  onCompleteTest={onCompleteTest}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
