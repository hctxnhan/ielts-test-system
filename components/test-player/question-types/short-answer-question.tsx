"use client";
import React from "react";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Label } from "@testComponents/components/ui/label";
import type { ShortAnswerQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";

interface ShortAnswerQuestionProps {
  question: ShortAnswerQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

export default function ShortAnswerQuestionRenderer({
  question,
  value = {},
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: ShortAnswerQuestionProps) {
  const handleChange = (subId: string, newValue: string) => {
    if (readOnly) return;

    const newAnswers = { ...(value || {}) };
    newAnswers[subId] = newValue;

    if (question.scoringStrategy === "partial") {
      onChange(newAnswers, subId);
    } else {
      onChange(newAnswers);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="font-medium text-sm whitespace-pre-line">
          {question.text?.split(/_{3,}/g)?.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              <span className="border-b border-gray-400 w-[60px] inline-block"></span>
            </React.Fragment>
          ))}
        </p>
        {question.wordLimit && (
          <p className="text-xs text-muted-foreground">
            Word limit: {question.wordLimit} words per answer
          </p>
        )}
      </div>

      <div className="space-y-2">
        {question.subQuestions.map((subQuestion, index) => {
          const questionNumber =
            question.scoringStrategy === "partial"
              ? `Q${question.index + index + 1}.`
              : `#${index + 1}.`;

          const userAnswer = value?.[subQuestion.subId] || "";
          const isCorrect =
            showCorrectAnswer &&
            userAnswer &&
            subQuestion.acceptableAnswers?.some(
              (answer) => answer.toLowerCase() === userAnswer.toLowerCase(),
            );
          const isIncorrect = showCorrectAnswer && !isCorrect;

          const questionText = question.questions.find(
            (q) => q.id === subQuestion.item,
          );

          return (
            <div key={subQuestion.subId} className="space-y-1.5 text-sm">
              <Label
                htmlFor={`short-answer-${subQuestion.subId}`}
                className="font-medium"
              >
                {questionNumber} {questionText?.text}
              </Label>
              <Textarea
                id={`short-answer-${subQuestion.subId}`}
                value={userAnswer}
                onChange={(e) =>
                  handleChange(subQuestion.subId, e.target.value)
                }
                placeholder={showCorrectAnswer ? "Not answered" : "Your answer"}
                className={cn(
                  "resize-none text-sm h-[60px] min-h-[60px]",
                  isCorrect && "border-green-500 bg-green-50",
                  isIncorrect && "border-red-500 bg-red-50",
                )}
                readOnly={readOnly}
              />
              {showCorrectAnswer &&
                isIncorrect &&
                subQuestion.acceptableAnswers && (
                  <div className="text-sm text-green-600">
                    ✓ One of following:{" "}
                    {subQuestion.acceptableAnswers.join(" / ")}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
