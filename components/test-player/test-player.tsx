'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTestStore } from '@/store/test-store';
import type { Test } from '@/lib/types';
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
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  SplitSquareVertical
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
  onBack: () => void;
}

export default function TestPlayer({ test, loading, onBack }: TestPlayerProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [showPassage, setShowPassage] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);

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
  }, [test, loadTest, resetTest]);

  // Start the test when instructions are dismissed
  const handleStartTest = useCallback(() => {
    setShowInstructions(false);
    startTest();
  }, [startTest]);

  // Handle test completion
  const handleCompleteTest = useCallback(() => {
    completeTest();
  }, [completeTest]);

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
  }, [nextQuestion]);

  const handlePreviousQuestion = useCallback(() => {
    previousQuestion();
  }, [previousQuestion]);

  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    setAudioPlayed(true);
  }, []);

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

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-muted-foreground">{section.title}</p>
        </div>

        <div className="flex items-center gap-4">
          <TestTimer
            initialTime={progress.timeRemaining}
            onTimeEnd={handleCompleteTest}
          />

          <Button variant="destructive" onClick={handleCompleteTest}>
            End Test
          </Button>
        </div>
      </div>

      <Progress value={calculateProgress()} className="mb-6" />

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
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    Question {progress.currentQuestionIndex + 1} of{' '}
                    {section.questions.length}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <QuestionRenderer question={question} sectionId={section.id} />
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={
                    progress.currentSectionIndex === 0 &&
                    progress.currentQuestionIndex === 0
                  }
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {isLastQuestion() ? (
                  <Button onClick={handleCompleteTest}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Finish Test
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
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
                    This section includes an audio recording. You will only hear
                    the recording once.
                  </AlertDescription>
                </Alert>
              )}

              {isReadingTest && (
                <Alert className="mb-4">
                  <AlertDescription>
                    This section includes a reading passage. You can toggle the
                    passage visibility using the button above.
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
  );
}
