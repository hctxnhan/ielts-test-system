'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTestStore } from '@/store/test-store';
import type { Test, Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  SplitSquareVertical,
  X,
  LayoutGrid
} from 'lucide-react';
import TestInstructions from './test-instructions';
import QuestionRenderer from './question-renderer';
import QuestionGroupRenderer from './question-group-renderer';
import TestTimer from './test-timer';
import TestResults from './test-results';
import ReadingPassageViewer from './reading-passage-viewer';
import AudioPlayer from './audio-player';

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
  onTestComplete
}: TestPlayerProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [showPassage, setShowPassage] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    loadTest,
    startTest,
    progress,
    nextQuestion,
    previousQuestion,
    currentSection,
    currentQuestion,
    isLastQuestion,
    completeTest,
    resetTest
  } = useTestStore();

  // Load the test when component mounts
  useEffect(() => {
    if (loading) return;
    loadTest(test);
    return () => {
      // Clean up when component unmounts
      resetTest();
    };
  }, [test, loadTest, resetTest, loading]);

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

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    if (!progress || !test) return 0;

    let totalQuestions = 0;
    let completedQuestions = 0;

    test.sections.forEach((section, sectionIndex) => {
      totalQuestions += section.questions.length;

      if (sectionIndex < progress.currentSectionIndex) {
        // All questions in previous sections are completed
        completedQuestions += section.questions.length;
      } else if (sectionIndex === progress.currentSectionIndex) {
        // Add questions completed in current section
        completedQuestions += Object.keys(progress.answers).filter((id) =>
          section.questions.some((q) => q.id === id)
        ).length;
      }
    });

    return (completedQuestions / totalQuestions) * 100;
  }, [progress, test]);

  // Toggle reading passage visibility
  const togglePassage = useCallback(() => {
    setShowPassage((prev) => !prev);
  }, []);

  // Memoized navigation handlers
  const handleNextQuestion = useCallback(() => {
    nextQuestion();
    setSidebarOpen(false);
  }, [nextQuestion]);

  const handlePreviousQuestion = useCallback(() => {
    previousQuestion();
    setSidebarOpen(false);
  }, [previousQuestion]);

  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    setAudioPlayed(true);
  }, []);

  // Jump to specific question
  const jumpToQuestion = useCallback(
    (sectionIndex: number, questionIndex: number) => {
      if (!progress) return;

      const updatedProgress = {
        ...progress,
        currentSectionIndex: sectionIndex,
        currentQuestionIndex: questionIndex
      };

      useTestStore.setState({ progress: updatedProgress });
      setSidebarOpen(false);
    },
    [progress]
  );

  // Check if a question has been answered
  const isQuestionAnswered = useCallback(
    (questionId: string) => {
      if (!progress) return false;
      return !!progress.answers[questionId];
    },
    [progress]
  );

  // If test is not loaded yet, show loading
  if (!test) {
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
        test={test}
        onStart={handleStartTest}
      />
    );
  }

  // If test is completed, show results
  if (progress?.completed) {
    return <TestResults />;
  }

  // Get current section and question
  const section = currentSection();
  const question = currentQuestion();

  if (!progress || !section || !question) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Error loading test content.</p>
      </div>
    );
  }

  const isReadingTest = test.type === 'reading';
  const isListeningTest = test.type === 'listening';

  // Check if current question is part of a group
  const isPartOfGroup = question.isPartOfGroup && question.groupId;
  const currentGroup =
    isPartOfGroup && section.questionGroups
      ? section.questionGroups.find((g) => g.id === question.groupId)
      : undefined;

  // Get all questions in the current group
  const groupQuestions = currentGroup
    ? section.questions.filter((q) => q.groupId === currentGroup.id)
    : [];

  // Sidebar content component to reuse in both desktop and mobile views
  const SidebarContent = () => (
    <>
      <div className="flex justify-between items-center mb-3 max-h-screen overflow-scroll">
        <TestTimer
          initialTime={progress.timeRemaining}
          onTimeEnd={handleCompleteTest}
        />
        <Button variant="destructive" size="sm" onClick={handleCompleteTest}>
          End Test
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {test.sections.map((testSection, sectionIndex) => (
          <div key={testSection.id} className="mb-6">
            <div className="mb-3">
              <h3 className="text-sm font-medium">
                Section {sectionIndex + 1}
              </h3>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {testSection.questions.map((q: Question, questionIndex) => {
                const isCurrentQuestion =
                  progress.currentSectionIndex === sectionIndex &&
                  progress.currentQuestionIndex === questionIndex;

                const isAnswered = isQuestionAnswered(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(sectionIndex, questionIndex)}
                    className="relative flex items-center justify-center"
                  >
                    <div
                      className={`
                      w-full aspect-square border rounded-md flex items-center justify-center
                      text-sm font-medium
                      ${
                        isCurrentQuestion
                          ? 'border-primary bg-primary/10'
                          : 'border-muted'
                      }
                    `}
                    >
                      {questionIndex + 1}
                    </div>
                    <div
                      className={`
                      absolute bottom-0 left-0 right-0 h-1 rounded-b-md
                      ${
                        isAnswered
                          ? 'bg-primary'
                          : isCurrentQuestion
                          ? 'bg-primary/40'
                          : 'bg-muted'
                      }
                    `}
                    ></div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </>
  );

  return (
    <div className="container mx-auto py-6 px-4">
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
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="w-64 hidden lg:block">
          <div className="sticky top-20">
            <Card className="shadow-sm p-3 flex flex-col h-[calc(100vh-6rem)]">
              <SidebarContent />
            </Card>
          </div>
        </div>
        {/* Main content area */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-muted-foreground">{section.title}</p>
          </div>

          {isListeningTest && section.audioUrl && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Listening Section</h2>
              <AudioPlayer src={section.audioUrl} onEnded={handleAudioEnded} />
              {!audioPlayed && (
                <Alert className="mt-2">
                  <AlertDescription>
                    In a real IELTS test, you would only hear the recording
                    once. Listen carefully.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {isReadingTest && section.readingPassage && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" /> Reading Passage
                </h2>
                <Button variant="outline" size="sm" onClick={togglePassage}>
                  {showPassage ? 'Hide Passage' : 'Show Passage'}
                  <SplitSquareVertical className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {showPassage && (
                <ReadingPassageViewer passage={section.readingPassage} />
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="section-info">Section Info</TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              {isPartOfGroup && currentGroup ? (
                <QuestionGroupRenderer
                  group={currentGroup}
                  questions={groupQuestions}
                  sectionId={section.id}
                />
              ) : (
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>
                      <span>
                        Question {progress.currentQuestionIndex + 1} of{' '}
                        {section.questions.length}
                      </span>
                    </CardTitle>

                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousQuestion}
                        disabled={
                          progress.currentSectionIndex === 0 &&
                          progress.currentQuestionIndex === 0
                        }
                        className="h-8 px-2"
                      >
                        <ArrowLeft className="h-3 w-3 mr-1" /> Prev
                      </Button>

                      {isLastQuestion() ? (
                        <Button
                          size="sm"
                          onClick={handleCompleteTest}
                          className="h-8 px-2"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Finish
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleNextQuestion}
                          className="h-8 px-2"
                        >
                          Next <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <QuestionRenderer
                      question={question}
                      sectionId={section.id}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="section-info">
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="mb-4">{section.description}</p>

                  {section.audioUrl && (
                    <Alert className="mb-4">
                      <AlertDescription>
                        This section includes an audio recording. You will only
                        hear the recording once.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isReadingTest && (
                    <Alert className="mb-4">
                      <AlertDescription>
                        This section includes a reading passage. You can toggle
                        the passage visibility using the button above.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Questions</p>
                      <p>{section.questions.length}</p>
                    </div>
                    <div>
                      <p className="font-medium">Time Allocated</p>
                      <p>{Math.floor(section.duration / 60)} minutes</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => setActiveTab('questions')}
                    className="w-full"
                  >
                    Return to Questions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
