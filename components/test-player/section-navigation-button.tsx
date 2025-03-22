"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SectionNavigationButtonProps {
  section: any;
  sectionIndex: number;
  isCurrentSection: boolean;
  isFullyAnswered: boolean;
  isPartiallyAnswered: boolean;
  onJumpToSection: (index: number) => void;
  onJumpToQuestion?: (sectionIndex: number, questionIndex: number) => void;
}

export default function SectionNavigationButton({
  section,
  sectionIndex,
  isCurrentSection,
  isFullyAnswered,
  isPartiallyAnswered,
  onJumpToSection,
  onJumpToQuestion,
}: SectionNavigationButtonProps) {
  const [expanded, setExpanded] = useState(isCurrentSection);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className="mb-2">
      <Button
        onClick={() => onJumpToSection(sectionIndex)}
        variant={isCurrentSection ? "default" : "outline"}
        className={`w-full justify-between ${
          isFullyAnswered
            ? "border-green-500 bg-green-50 hover:bg-green-100 text-green-800"
            : isPartiallyAnswered
            ? "border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-800"
            : ""
        }`}
      >
        <div className="flex items-center">
          {section.title}
          <div className="ml-2 text-xs">
            {(() => {
              const firstQuestion = section.questions[0];
              const lastQuestion = section.questions.at(-1);
              const startIndex = firstQuestion.index;
              const endIndex =
                lastQuestion.partialEndingIndex || lastQuestion.index;
              const questionCount = endIndex - startIndex + 1;
              return `(${questionCount} questions)`;
            })()}
          </div>
        </div>
        <button onClick={toggleExpand} className="p-1 text-xs">
          {expanded ? "▲" : "▼"}
        </button>
      </Button>

      {expanded && (
        <div className="pl-4 mt-1 space-y-1 grid grid-cols-5 gap-2">
          {section.questions.map((question: any, qIndex: number) => {
            // If it's a partial question with range, split it into individual questions
            if (question.partialEndingIndex) {
              const individualQuestions = [];
              for (
                let i = question.index;
                i <= question.partialEndingIndex;
                i++
              ) {
                individualQuestions.push(
                  <div
                    key={`${qIndex}-${i}`}
                    onClick={() => onJumpToQuestion?.(sectionIndex, qIndex)}
                    className="flex justify-center"
                  >
                    <div
                      className={`
                        w-8 h-8 flex items-center justify-center text-sm font-medium rounded-sm cursor-pointer
                        ${
                          question.answered
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {i}
                    </div>
                  </div>
                );
              }
              return individualQuestions;
            }

            // For regular questions
            return (
              <div
                key={qIndex}
                onClick={() => onJumpToQuestion?.(sectionIndex, qIndex)}
                className="flex justify-center"
              >
                <div
                  className={`
                    w-8 h-8 flex items-center justify-center text-sm font-medium rounded-sm cursor-pointer
                    ${
                      question.answered
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {question.index}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
