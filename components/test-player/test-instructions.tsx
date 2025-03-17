'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import type { Test } from '@/lib/types';
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  Clock,
  Headphones,
  HelpCircle,
  Layers,
  Layout,
  Pencil,
  PlayCircle
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip';

interface TestInstructionsProps {
  test: Test;
  onStart: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function TestInstructions({
  test,
  loading,
  onBack,
  onStart
}: TestInstructionsProps) {
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-muted-foreground">Loading test details...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto py-10 px-4 flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-xl font-medium">
          Test not found or not available yet.
        </p>
        <Button variant="outline" onClick={onBack}>
          Return to Tests
        </Button>
      </div>
    );
  }

  // Calculate total questions
  const totalQuestions = test.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  // Get test icon based on type
  const getTestIcon = () => {
    switch (test.type) {
      case 'listening':
        return <Headphones className="w-5 h-5" />;
      case 'writing':
        return <Pencil className="w-5 h-5" />;
      case 'reading':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Layout className="w-5 h-5" />;
    }
  };

  // Format time from seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Tests
          </Button>
        </div>

        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-xs font-normal"
              >
                {test.type.toUpperCase()}
              </Badge>
              {test.readingVariant && (
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 text-xs font-normal"
                >
                  {test.readingVariant.toUpperCase()}
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              {getTestIcon()}
              {test.title}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {test.description ||
                `Practice your ${test.type} skills with this comprehensive test.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="space-y-8">
              {/* Test Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Test Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 p-2 rounded-full mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">
                      {Math.floor(test.totalDuration / 60)}
                    </p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 p-2 rounded-full mb-2">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{test.sections.length}</p>
                    <p className="text-sm text-muted-foreground">Sections</p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 p-2 rounded-full mb-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 p-2 rounded-full mb-2">
                      {getTestIcon()}
                    </div>
                    <p className="text-2xl font-bold capitalize">{test.type}</p>
                    <p className="text-sm text-muted-foreground">Test Type</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section Breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Section Breakdown
                </h3>
                <div className="space-y-4">
                  {test.sections.map((section, index) => (
                    <Card key={section.id} className="overflow-hidden">
                      <div className="bg-primary/5 px-4 py-3 border-b flex justify-between items-center">
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">
                            {index + 1}
                          </span>
                          {section.title || `Section ${index + 1}`}
                        </h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {formatTime(section.duration)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Section duration</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-muted-foreground mb-3">
                          {section.description ||
                            `This section contains ${section.questions.length} questions.`}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-1 text-sm">
                            <HelpCircle className="w-4 h-4 text-primary" />
                            <span>{section.questions.length} Questions</span>
                          </div>

                          {section.audioUrl && (
                            <div className="flex items-center gap-1 text-sm">
                              <Headphones className="w-4 h-4 text-primary" />
                              <span>Audio Included</span>
                            </div>
                          )}

                          {section.readingPassage && (
                            <div className="flex items-center gap-1 text-sm">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span>Reading Passage</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Section Weight</span>
                            <span>
                              {Math.round(
                                (section.questions.length / totalQuestions) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={Math.round(
                              (section.questions.length / totalQuestions) * 100
                            )}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                <h3 className="text-sm font-medium mb-2">Test Instructions</h3>
                <p className="text-sm text-muted-foreground">
                  {test.instructions ||
                    `This ${test.type} test consists of ${
                      test.sections.length
                    } sections with a total of ${totalQuestions} questions. 
                    You will have ${Math.floor(
                      test.totalDuration / 60
                    )} minutes to complete the test. 
                    Read each question carefully before answering.`}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6 flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total time:{' '}
              <span className="font-medium">
                {Math.floor(test.totalDuration / 60)} minutes
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button className="gap-2" onClick={onStart}>
                <PlayCircle className="w-4 h-4" />
                Start Test
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
