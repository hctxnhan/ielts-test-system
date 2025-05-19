"use client";
import React from "react";
import { Button } from "@testComponents/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@testComponents/components/ui/tooltip";
import {
  getQuestionStatus,
  getSectionStats,
} from "@testComponents/lib/test-utils";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SectionNavigationButtonProps {
  section: any;
  sectionIndex: number;
  isCurrentSection: boolean;
  onJumpToSection: (index: number) => void;
  answers?: Record<string, any>; // Add answers prop to track question status
}

export default function SectionNavigationButton({
  section,
  sectionIndex,
  isCurrentSection,
  onJumpToSection,
  answers = {},
}: SectionNavigationButtonProps) {
  const [expanded, setExpanded] = useState(true);

  const sectionStatus = getSectionStats(section, answers);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Calculate question count and completion status
  const firstQuestion = section.questions[0];
  const lastQuestion = section.questions.at(-1);
  const startIndex = firstQuestion.index;
  const endIndex = lastQuestion.partialEndingIndex || lastQuestion.index;

  const questionCount = endIndex - startIndex + 1;

  // Count answered questions
  const answeredQuestionsCount = sectionStatus.sectionAnswers.length;

  // Get section completion percentage
  const completionPercentage = Math.round(
    (answeredQuestionsCount / sectionStatus.sectionTotalQuestions) * 100,
  );

  const isFullyAnswered = completionPercentage === 100;

  return (
    <div className="mb-1">
      {/* Section header with compact styling */}
      <div
        className={`
          rounded-md overflow-hidden border transition-all duration-200
          ${isCurrentSection ? "border-primary/40" : "border-muted"}
          ${isFullyAnswered ? "bg-green-50 dark:bg-green-900/20" : ""}
        `}
      >
        {/* Top section with title and controls */}
        <div
          onClick={() => onJumpToSection(sectionIndex)}
          className={`
            px-1.5 py-1 flex items-center justify-between cursor-pointer
            ${isCurrentSection ? "bg-primary/10" : ""}
          `}
        >
          {/* Left side: Section info */}
          <div className="flex items-center gap-1 min-w-0">
            {/* Section number indicator */}
            <div
              className={`
              w-4 h-4 rounded-full flex items-center justify-center shrink-0
              ${
                isCurrentSection
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }
            `}
            >
              <span className="text-sm font-medium">{sectionIndex + 1}</span>
            </div>

            {/* Section title and stats */}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">
                {section.title}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{questionCount} Q</span>
                <span className="mx-0.5">•</span>
                <span className="flex items-center">
                  {isFullyAnswered ? (
                    <CheckCircle className="w-2.5 h-2.5 text-green-500 mr-0.5" />
                  ) : (
                    <span>{completionPercentage}%</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Controls */}
          <div className="flex items-center pl-0.5">
            {/* Compact progress indicator */}
            {!isFullyAnswered && completionPercentage > 0 && (
              <div className="w-6 h-0.5 mr-0.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            )}

            {/* Expand/collapse button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="p-0 h-4 w-4 rounded-full"
            >
              {expanded ? (
                <ChevronUp className="h-2.5 w-2.5" />
              ) : (
                <ChevronDown className="h-2.5 w-2.5" />
              )}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="bg-muted/5 px-1.5 py-2 border-t">
            <div className="grid gap-2 justify-start [grid-template-columns:repeat(auto-fit,minmax(30px,1fr))] w-full">
              {section.questions.map((question: any, qIndex: number) => {
                // Check if this is a partial question with a range
                if (
                  question.scoringStrategy === "partial" &&
                  question.partialEndingIndex !== undefined
                ) {
                  // Handle partial questions with range (multiple numbered questions)
                  const individualQuestions = [];

                  for (
                    let i = question.index;
                    i <= question.partialEndingIndex;
                    i++
                  ) {
                    const j = i - question.index;
                    const subQuestion = question.subQuestions?.[j];

                    // Determine question status for this specific sub-question
                    const status = subQuestion
                      ? getQuestionStatus(subQuestion.subId, answers)
                      : "untouched";

                    // Display number is i (from index to partialEndingIndex)
                    const displayNumber = i + 1;

                    individualQuestions.push(
                      <TooltipProvider key={`${qIndex}-${i}`}>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div className="">
                              <div
                                className={`
                                  w-full aspect-square flex items-center justify-center text-sm font-medium 
                                  rounded transition-colors duration-150 relative
                                  ${
                                    status === "completed"
                                      ? "bg-primary text-white"
                                      : "bg-white border border-muted text-muted-foreground"
                                  }
                                `}
                              >
                                {displayNumber}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="py-1 px-2"
                          >
                            <p className="text-sm">
                              Q{displayNumber}:{" "}
                              {status === "completed"
                                ? "Completed"
                                : "Not answered"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>,
                    );
                  }

                  return individualQuestions;
                }

                // For standard questions, render as a single question with its index
                // Status is determined based on the whole question ID
                const status = getQuestionStatus(question.id, answers);
                const displayNumber = question.index + 1;

                return (
                  <TooltipProvider key={qIndex}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <div
                            className={`
                            w-full aspect-square flex items-center justify-center text-sm font-medium 
                            rounded transition-colors duration-150 relative
                            ${
                              status === "completed"
                                ? "bg-primary text-white"
                                : "bg-white border border-muted text-muted-foreground"
                            }
                          `}
                          >
                            {displayNumber}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="py-1 px-2"
                      >
                        <p className="text-sm">
                          Q{displayNumber}:{" "}
                          {status === "completed"
                            ? "Completed"
                            : "Not answered"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
