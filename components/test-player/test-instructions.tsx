"use client";

import { Button } from "@testComponents/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@testComponents/components/ui/card";
import { countSectionQuestion } from "@testComponents/lib/test-utils";
import type { Test } from "@testComponents/lib/types";
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
import { useState } from "react";

// IELTS band score chart component
const BandScore = ({ score }: { score: number }) => {
  const getColor = (band: number) => {
    if (band < 3) return "bg-red-500";
    if (band < 5) return "bg-orange-500";
    if (band < 6.5) return "bg-yellow-500";
    if (band < 8) return "bg-green-500";
    return "bg-emerald-500";
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3 w-3 rounded-full ${getColor(score)}`}></div>
      <span className="font-medium text-sm">{score.toFixed(1)}</span>
    </div>
  );
};

// Section item component
const SectionItem = ({
  section,
  index,
  totalQuestions,
}: {
  section: any;
  index: number;
  totalQuestions: number;
}) => {
  const questionCount = countSectionQuestion(section.questions);

  // Format time from seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
  };

  return (
    <div className="p-3 sm:p-4 border rounded-lg bg-muted/10 shadow-sm hover:bg-muted/20 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white bg-primary text-xs sm:text-sm shadow-sm">
            {index + 1}
          </div>

          <div>
            <h4 className="font-medium text-sm sm:text-base">
              {section.title || `Section ${index + 1}`}
            </h4>
            <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formatTime(section.duration)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <HelpCircle className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {questionCount} Questions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorState = ({ onBack }: { onBack?: () => void }) => (
  <div className="flex flex-col justify-center items-center min-h-[50vh] gap-3">
    <AlertCircle className="w-10 h-10 text-muted-foreground" />
    <p className="text-lg font-medium">Test not found or not available yet.</p>
    <Button variant="outline" onClick={onBack}>
      Return to Tests
    </Button>
  </div>
);

interface TestInstructionsProps {
  test: Test;
  onStart: (
    customMode?: boolean,
    selectedSections?: string[],
    selectedTypes?: string[],
    realTestMode?: boolean
  ) => void;
  onBack?: () => void;
}

export default function TestInstructions({
  test,
  onBack,
  onStart,
}: TestInstructionsProps) {
  const [realTestMode, setRealTestMode] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  // Initialize with all sections and types selected by default
  const [selectedSections, setSelectedSections] = useState<string[]>(
    test?.sections.map((s) => s.id) || []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    if (!test) return [];
    return Array.from(
      new Set(test.sections.flatMap((s) => s.questions.map((q) => q.type)))
    );
  });

  if (!test) return <ErrorState onBack={onBack} />;

  const allQuestionTypes = Array.from(
    new Set(test.sections.flatMap((s) => s.questions.map((q) => q.type)))
  );

  const totalQuestions = test.sections.reduce(
    (acc, section) => acc + countSectionQuestion(section.questions),
    0
  );

  const handleStart = () => {
    // Prevent starting with no sections or question types in custom mode
    if (
      customMode &&
      (selectedSections.length === 0 || selectedTypes.length === 0)
    ) {
      return;
    }

    onStart(
      customMode,
      selectedSections.length > 0 ? selectedSections : undefined,
      selectedTypes.length > 0 ? selectedTypes : undefined,
      realTestMode
    );
  };

  // Get test icon based on type
  const getTestIcon = () => {
    switch (test.type) {
      case "listening":
        return <Headphones className="w-5 h-5" />;
      case "writing":
        return <Pencil className="w-5 h-5" />;
      case "reading":
        return <BookOpen className="w-5 h-5" />;
      case "speaking":
        return <Headphones className="w-5 h-5" />;
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

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 mb-3 sm:mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Button>

        <Card className="overflow-hidden shadow-md">
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${getTestColor()} p-4 md:p-6 text-white`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-white/20 rounded-full">
                  {getTestIcon()}
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="uppercase font-semibold text-xs md:text-sm tracking-wider opacity-90">
                      {test.type} Test
                    </span>
                    {test.readingVariant && (
                      <Badge
                        variant="secondary"
                        className="bg-white/30 hover:bg-white/40 text-white border-none text-xs px-2 py-0.5"
                      >
                        {test.readingVariant.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold mt-1">
                    {test.title}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm bg-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{Math.floor(test.totalDuration / 60)} min</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="py-3 px-4 md:py-4 md:px-5 bg-muted/10 border-b flex flex-wrap items-center justify-between gap-y-3">
            <div className="flex items-center gap-5 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="text-lg md:text-xl font-bold text-primary">
                  {totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Questions
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-lg md:text-xl font-bold text-primary">
                  {test.sections.length}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Sections
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-white border rounded-lg shadow-sm">
              <Target className="text-primary w-4 h-4 md:w-4.5 md:h-4.5" />
              <div>
                <div className="text-xs text-muted-foreground leading-tight">
                  Target
                </div>
                <div className="flex gap-2 items-center mt-0.5">
                  {[6.5, 7.0, 7.5].map((score) => (
                    <BandScore key={score} score={score} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side layout for instructions and test configuration */}
          <div className="flex flex-col gap-6 p-3 sm:p-5">
            {/* Left side - Instructions and Test Structure */}
            <div className="space-y-4 sm:space-y-6 text-sm">
              {test.description && (
                <p className="text-sm sm:text-base leading-relaxed">
                  {test.description}
                </p>
              )}
              Instructions
              <div className="bg-muted/10 rounded-lg border overflow-hidden shadow-sm">
                <div className="bg-muted/30 py-2 px-3 sm:py-2.5 sm:px-4 border-b flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span>Instructions</span>
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs h-5 sm:h-6 px-2 sm:px-2.5"
                  >
                    Important
                  </Badge>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="leading-relaxed text-sm sm:text-base">
                    {test.instructions ||
                      `This ${test.type} test consists of ${
                        test.sections.length
                      } sections with ${totalQuestions} questions. 
                      You will have ${Math.floor(
                        test.totalDuration / 60
                      )} minutes to complete the test. 
                      Read each question carefully before answering.`}
                  </p>
                </div>
              </div>
              {/* Sections */}
              <div>
                <h3 className="font-medium flex items-center gap-1.5 sm:gap-2 pb-2 sm:pb-2.5 mb-2 sm:mb-3 border-b text-sm sm:text-base">
                  <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                  <span>Test Structure</span>
                </h3>

                <div className="grid gap-2 sm:gap-3">
                  {test.sections.map((section, index) => (
                    <SectionItem
                      key={section.id}
                      section={section}
                      index={index}
                      totalQuestions={totalQuestions}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Test Mode Configuration */}
            <div className="space-y-4">
              <div className="bg-muted/10 rounded-lg border overflow-hidden shadow-sm">
                <div className="bg-muted/30 py-2 px-3 sm:py-2.5 sm:px-4 border-b">
                  <h3 className="font-medium flex items-center gap-2 text-xs sm:text-sm">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span>Test Mode Configuration</span>
                  </h3>
                </div>

                <div className="p-4">
                  {/* Mode Selection */}
                  <div className="space-y-3 mb-4">
                    <label className="relative block">
                      <input
                        type="checkbox"
                        checked={realTestMode}
                        onChange={(e) => {
                          setRealTestMode(e.target.checked);
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          realTestMode
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                              realTestMode
                                ? "border-primary bg-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {realTestMode && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                          <span className="font-medium text-sm">
                            Real Test Mode
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Audio auto-plays, no manual controls, original timing
                        </p>
                      </div>
                    </label>

                    <label className="relative block">
                      <input
                        type="checkbox"
                        checked={customMode}
                        onChange={(e) => {
                          setCustomMode(e.target.checked);
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          customMode
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                              customMode
                                ? "border-primary bg-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {customMode && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                          <span className="font-medium text-sm">
                            Custom Practice
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Select specific sections and question types
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Custom mode options */}
                  {customMode && (
                    <div className="p-4 bg-muted/10 border rounded-lg space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">Sections</h4>
                          <span className="text-xs text-muted-foreground">
                            {selectedSections.length} of {test.sections.length}{" "}
                            selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {test.sections.map((section) => (
                            <label
                              key={section.id}
                              className="flex items-center gap-2 p-2 hover:bg-muted/20 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSections.includes(section.id)}
                                onChange={(e) => {
                                  const newSelection = e.target.checked
                                    ? [...selectedSections, section.id]
                                    : selectedSections.filter(
                                        (id) => id !== section.id
                                      );

                                  if (newSelection.length > 0) {
                                    setSelectedSections(newSelection);
                                  }
                                }}
                                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <span className="text-sm flex-1">
                                {section.title || section.id}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {countSectionQuestion(section.questions)} questions
                              </span>
                            </label>
                          ))}
                        </div>
                        {selectedSections.length === 0 && (
                          <p className="text-xs text-red-500 mt-2">
                            At least one section must be selected
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">
                            Question Types
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {selectedTypes.length} of {allQuestionTypes.length}{" "}
                            selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {allQuestionTypes.map((type) => (
                            <label
                              key={type}
                              className="flex items-center gap-2 p-2 hover:bg-muted/20 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTypes.includes(type)}
                                onChange={(e) => {
                                  const newSelection = e.target.checked
                                    ? [...selectedTypes, type]
                                    : selectedTypes.filter((t) => t !== type);

                                  if (newSelection.length > 0) {
                                    setSelectedTypes(newSelection);
                                  }
                                }}
                                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <span className="text-sm capitalize">
                                {type.replace(/-/g, " ")}
                              </span>
                            </label>
                          ))}
                        </div>
                        {selectedTypes.length === 0 && (
                          <p className="text-xs text-red-500 mt-2">
                            At least one question type must be selected
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button
              className="w-full gap-2 py-2.5 text-sm font-medium relative overflow-hidden shadow-lg"
              onClick={handleStart}
              disabled={
                customMode &&
                (selectedSections.length === 0 || selectedTypes.length === 0)
              }
              size="lg"
            >
              <PlayCircle className="w-4 h-4" />
              Start Test
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
