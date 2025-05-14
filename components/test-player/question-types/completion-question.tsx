"use client";
import React from "react";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import type { CompletionQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";

interface CompletionQuestionProps {
  question: CompletionQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

export default function CompletionQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: CompletionQuestionProps) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{question.text}</p>
      <div className="space-y-2">
        {question.subQuestions.map((subQuestion, index) => {
          const userAnswer = value?.[subQuestion.subId] || "";
          const normalizedUserAnswer = userAnswer
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
          const isCorrect =
            showCorrectAnswer &&
            subQuestion.acceptableAnswers?.some(
              (answer) =>
                answer.trim().toLowerCase().replace(/\s+/g, " ") ===
                normalizedUserAnswer,
            );
          const isIncorrect = showCorrectAnswer && !isCorrect;

          return (
            <div
              key={subQuestion.subId}
              className="flex gap-1.5 items-center text-sm"
            >
              <Label htmlFor={`blank-${subQuestion.subId}`} className="w-16">
                {question.scoringStrategy === "partial"
                  ? `Q${question.index + index + 1}:`
                  : `#${index + 1}:`}
              </Label>
              <div className="relative flex gap-6">
                <Input
                  id={`blank-${subQuestion.subId}`}
                  value={userAnswer}
                  onChange={(e) => {
                    if (!readOnly) {
                      const newAnswers = { ...(value || {}) };
                      newAnswers[subQuestion.subId] = e.target.value;
                      if (question.scoringStrategy === "partial") {
                        onChange(newAnswers, subQuestion.subId);
                      } else {
                        onChange(newAnswers);
                      }
                    }
                  }}
                  readOnly={readOnly}
                  placeholder={readOnly ? "Not answered" : "Your answer"}
                  className={cn(
                    "max-w-md pr-8 h-8 text-sm",
                    isCorrect && "border-green-500 bg-green-50",
                    isIncorrect && "border-red-500 bg-red-50",
                  )}
                />
                {isIncorrect && showCorrectAnswer && (
                  <div className="text-sm flex items-center">
                    <span className="text-green-600">
                      ✓ {subQuestion.acceptableAnswers?.[0] || ""}
                      {subQuestion.acceptableAnswers &&
                        subQuestion.acceptableAnswers.length > 1 && (
                          <span className="text-gray-500 ml-1">
                            (or:{" "}
                            {subQuestion.acceptableAnswers.slice(1).join(", ")})
                          </span>
                        )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
