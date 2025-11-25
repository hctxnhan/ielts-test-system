"use client";

import React from "react";
import { Alert, AlertDescription } from "@testComponents/components/ui/alert";
import { Button } from "@testComponents/components/ui/button";
import { Card, CardContent } from "@testComponents/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@testComponents/components/ui/popover";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
import { ScrollArea } from "@testComponents/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@testComponents/components/ui/tabs";
import type { Test, TestProgress } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { SplitSquareVertical, HelpCircle, Lightbulb, BookOpenCheck, ChevronLeft } from "lucide-react";
import { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AudioPlayer from "./audio-player";
import ReadingPassageViewer from "./reading-passage-viewer";
import SectionQuestionsRenderer from "./section-questions-renderer";
import TestBottomNavigation from "./test-bottom-navigation";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@testComponents/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";

import _ from "lodash";


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
        {test.isExercise &&
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 mb-3 sm:mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Button>
        }

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{test.title}</h1>
        </div>

        {isListeningTest && (test.audioUrl || currentSection.audioUrl) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Listening Section</h2>
            <AudioPlayer
              src={
                realTestMode
                  ? test.audioUrl ?? ""
                  : currentSection.audioUrl ?? ""
              }
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
            {!_.isEmpty(currentSection.transcript) && readOnly && (
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="transcript">
                  <AccordionTrigger className="text-sm font-bold no-underline">
                    Hiện Transcript
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <AnimatePresence initial={false}>
                      <motion.div
                        key="transcript"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-sm leading-relaxed prose max-w-none overflow-hidden"
                      >
                        <RichTextContent content={currentSection.transcript} />
                      </motion.div>
                    </AnimatePresence>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
              className={`lg:transition-all lg:duration-300 ${showPassage
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

        {/* Floating Help Button */}
        {(test.tips || test.vocabulary) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
              >
                <HelpCircle className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-120 max-w-96  p-0 shadow-xl border-0 bg-white rounded-xl overflow-hidden"
              side="top"
              align="end"
              sideOffset={8}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help & Resources
                </h3>
              </div>

              {/* Content */}
              <div className="max-h-96">
                <Tabs defaultValue={test.tips ? "tips" : "vocabulary"} className="w-full">
                  <TabsList className={`grid w-full bg-gray-50 m-0 h-10 rounded-none border-b ${test.tips && test.vocabulary ? 'grid-cols-2' : 'grid-cols-1'
                    }`}>
                    {test.tips && (
                      <TabsTrigger
                        value="tips"
                        className="flex items-center gap-1.5 text-xs h-full rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        Tips
                      </TabsTrigger>
                    )}
                    {test.vocabulary && (
                      <TabsTrigger
                        value="vocabulary"
                        className="flex items-center gap-1.5 text-xs h-full rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none"
                      >
                        <BookOpenCheck className="w-3.5 h-3.5" />
                        Vocabulary
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {test.tips && (
                    <TabsContent value="tips" className="m-0 p-4 max-h-80 overflow-y-auto">
                      <RichTextContent
                        content={test.tips}
                        className="text-sm leading-relaxed prose prose-sm max-w-none"
                      />
                    </TabsContent>
                  )}

                  {test.vocabulary && (
                    <TabsContent value="vocabulary" className="m-0 p-4 max-h-80 overflow-y-auto">
                      <RichTextContent
                        content={test.vocabulary}
                        className="text-sm leading-relaxed prose prose-sm max-w-none"
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </PopoverContent>
          </Popover>
        )}

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
