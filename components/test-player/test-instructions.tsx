"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { countSectionQuestion } from "@/lib/test-utils";
import type { Test } from "@/lib/types";
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
  PlayCircle,
  Target,
} from "lucide-react";
import { Badge } from "../ui/badge";

// Add IELTS band score chart component
const BandScore = ({ score }: { score: number }) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-500",
  ];

  const getColor = (band: number) => {
    if (band < 3) return colors[0];
    if (band < 5) return colors[1];
    if (band < 6.5) return colors[2];
    if (band < 8) return colors[3];
    return colors[4];
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${getColor(score)}`}></div>
      <span className="font-medium">{score.toFixed(1)}</span>
    </div>
  );
};

interface TestInstructionsProps {
  test: Test;
  onStart: () => void;
  onBack?: () => void;
  loading: boolean;
}

export default function TestInstructions({
  test,
  loading,
  onBack,
  onStart,
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

  const totalQuestions = test.sections.reduce(
    (acc, section) => acc + countSectionQuestion(section.questions),
    0
  );

  // Get test icon based on type
  const getTestIcon = () => {
    switch (test.type) {
      case "listening":
        return <Headphones className="w-5 h-5" />;
      case "writing":
        return <Pencil className="w-5 h-5" />;
      case "reading":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Layout className="w-5 h-5" />;
    }
  };

  // Get test theme color
  const getTestColor = () => {
    switch (test.type) {
      case "listening":
        return "from-purple-500 to-indigo-600";
      case "reading":
        return "from-blue-500 to-blue-700";
      case "writing":
        return "from-emerald-500 to-teal-600";
      case "speaking":
        return "from-amber-500 to-orange-600";
      default:
        return "from-primary to-primary-foreground";
    }
  };

  // Format time from seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Tests
          </Button>
        </div>

        {/* Main card with gradient header based on test type */}
        <Card className="overflow-hidden shadow-md">
          <div className={`bg-gradient-to-r ${getTestColor()} p-6 text-white`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-full">
                  {getTestIcon()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="uppercase font-semibold text-sm tracking-wider opacity-90">
                      {test.type} Test
                    </span>
                    {test.readingVariant && (
                      <Badge
                        variant="secondary"
                        className="bg-white/30 hover:bg-white/40 text-white border-none text-xs"
                      >
                        {test.readingVariant.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                    {test.title}
                  </h1>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(test.totalDuration / 60)} minutes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-muted/40 to-transparent border-b flex flex-wrap gap-4 justify-center sm:justify-between">
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {test.sections.length}
                </div>
                <div className="text-xs text-muted-foreground">Sections</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md">
              <Target className="text-primary w-5 h-5" />
              <div className="flex flex-col">
                <div className="text-xs text-muted-foreground">Target Band</div>
                <div className="flex gap-2 items-center">
                  {[6.5, 7.0, 7.5].map((score) => (
                    <BandScore key={score} score={score} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="py-5">
            {test.description && (
              <div className="mb-4 text-sm">{test.description}</div>
            )}

            <div className="space-y-5">
              {/* Instructions with improved styling */}
              <div className="bg-muted/20 rounded-lg border overflow-hidden">
                <div className="bg-muted/30 py-2 px-4 border-b flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-primary" />
                    <span>Test Instructions</span>
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Important
                  </Badge>
                </div>
                <div className="p-4">
                  <p className="text-sm prose-sm max-w-none">
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

              {/* Section Overview with improved visual hierarchy */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-1.5 pb-2 border-b">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Test Structure</span>
                </h3>

                <div className="grid gap-3">
                  {test.sections.map((section, index) => {
                    const questionCount = countSectionQuestion(
                      section.questions
                    );

                    return (
                      <div
                        key={section.id}
                        className={`p-4 border rounded-lg ${
                          index === 0 ? "bg-muted/10 shadow-sm" : "bg-white"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3">
                            <div
                              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white
                                ${index === 0 ? "bg-primary" : "bg-muted"}`}
                            >
                              {index + 1}
                            </div>

                            <div>
                              <h4 className="font-medium text-sm">
                                {section.title || `Section ${index + 1}`}
                              </h4>

                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {formatTime(section.duration)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {questionCount} Questions
                                  </span>
                                </div>

                                {section.readingPassage && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 text-xs font-normal"
                                  >
                                    Reading Passage
                                  </Badge>
                                )}

                                {section.audioUrl && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 text-xs font-normal"
                                  >
                                    Audio
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="ml-12 sm:ml-0">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">
                                Section Weight
                              </span>
                              <span className="font-medium">
                                {Math.round(
                                  (questionCount / totalQuestions) * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full sm:w-36 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${
                                  index === 0
                                    ? "bg-primary"
                                    : "bg-muted-foreground/70"
                                }`}
                                style={{
                                  width: `${Math.round(
                                    (questionCount / totalQuestions) * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress indicator */}
                <div className="flex justify-center mt-2">
                  {test.sections.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mx-1 ${
                        i === 0 ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 border-t bg-muted/10 flex flex-col-reverse sm:flex-row gap-3 justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="gap-2 w-full sm:w-auto group relative overflow-hidden"
              onClick={onStart}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Start Test
              </div>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
