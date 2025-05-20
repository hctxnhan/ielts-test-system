"use client";
import React from "react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import { Label } from "@testComponents/components/ui/label";
import type { TrueFalseNotGivenQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";

interface TrueFalseNotGivenQuestionProps {
  question: TrueFalseNotGivenQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

export default function TrueFalseNotGivenQuestion({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: TrueFalseNotGivenQuestionProps) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm whitespace-pre-line leading-relaxed">
        {question.text?.split(/_{3,}/g)?.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            <span className="border-b border-gray-400 w-[60px] inline-block"></span>
          </React.Fragment>
        ))}
      </p>
      <div className="space-y-2">
        {question.statements.map((statement, index) => {
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === statement.id
          );

          if (!subQuestion) return null;

          const userAnswer = value?.[subQuestion.subId];
          const isCorrect =
            showCorrectAnswer && userAnswer === subQuestion.correctAnswer;
          const isIncorrect = showCorrectAnswer && !isCorrect;

          return (
            <div key={statement.id} className="space-y-1.5 text-sm">
              <p className="font-medium">
                {question.scoringStrategy === "partial" && subQuestion
                  ? `Q${question.index + index + 1}.`
                  : `#${index + 1}.`}{" "}
                {statement.text}
              </p>
              <RadioGroup
                value={userAnswer}
                onValueChange={(val) => {
                  if (!readOnly) {
                    const newAnswers = { ...(value || {}) };
                    newAnswers[subQuestion.subId] = val;

                    if (question.scoringStrategy === "partial") {
                      onChange(newAnswers, subQuestion.subId);
                    } else {
                      onChange(newAnswers);
                    }
                  }
                }}
                className={cn(
                  "flex gap-4 p-1.5 rounded",
                  isCorrect && "bg-green-50 border border-green-500",
                  isIncorrect && "bg-red-50 border border-red-500"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem
                    value="true"
                    id={`true-${statement.id}`}
                    disabled={readOnly}
                    className={cn(
                      isCorrect && userAnswer === "true" && "text-green-600",
                      isIncorrect && userAnswer === "true" && "text-red-600"
                    )}
                  />
                  <Label htmlFor={`true-${statement.id}`}>True</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem
                    value="false"
                    id={`false-${statement.id}`}
                    disabled={readOnly}
                    className={cn(
                      isCorrect && userAnswer === "false" && "text-green-600",
                      isIncorrect && userAnswer === "false" && "text-red-600"
                    )}
                  />
                  <Label htmlFor={`false-${statement.id}`}>False</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem
                    value="not-given"
                    id={`not-given-${statement.id}`}
                    disabled={readOnly}
                    className={cn(
                      isCorrect &&
                        userAnswer === "not-given" &&
                        "text-green-600",
                      isIncorrect &&
                        userAnswer === "not-given" &&
                        "text-red-600"
                    )}
                  />
                  <Label htmlFor={`not-given-${statement.id}`}>Not Given</Label>
                </div>
              </RadioGroup>
              {isIncorrect && showCorrectAnswer && (
                <div className="text-sm text-green-600 mt-0.5">
                  ✓{" "}
                  {subQuestion.correctAnswer
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
