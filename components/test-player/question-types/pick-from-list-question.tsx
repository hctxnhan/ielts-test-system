"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@testComponents/components/ui/select";
import { Label } from "@testComponents/components/ui/label";
import type { PickFromAListQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";

interface PickFromListQuestionProps {
  question: PickFromAListQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

export default function PickFromListQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: PickFromListQuestionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (value) {
      setSelectedAnswers(value);
    }
  }, [value]);

  const handleItemSelection = (itemId: string, subQuestionId: string) => {
    if (readOnly) return;

    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      updated[subQuestionId] = itemId;

      if (question.scoringStrategy === "partial") {
        onChange(updated, subQuestionId);
      } else {
        onChange(updated);
      }

      return updated;
    });
  };

  const subQuestions = question.subQuestions || [];

  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-sm mb-2">{question.text}</p>

        <div className="bg-muted/30 p-2 rounded-md text-sm">
          <h4 className="font-medium mb-1">List of Items:</h4>
          <div className="pl-3">
            {question.items.map((item, index) => (
              <div key={item.id} className="mb-0.5">
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>{" "}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {subQuestions.map((subQuestion, index) => {
          const questionNumber =
            question.scoringStrategy === "partial"
              ? question.index + index + 1
              : index + 1;

          const selectedItemId = selectedAnswers[subQuestion.subId];
          const isCorrect =
            showCorrectAnswer && subQuestion.item === selectedItemId;
          const isIncorrect = showCorrectAnswer && !isCorrect;

          const correctAnswerIndex = question.items.findIndex(
            (item) => item.id === subQuestion.item,
          );
          const correctAnswer = question.items[correctAnswerIndex]?.text;
          const correctAnswerLabel = String.fromCharCode(
            65 + correctAnswerIndex,
          );

          return (
            <div
              key={subQuestion.subId}
              className="flex items-center gap-1.5 text-sm"
            >
              <Label className="w-16">
                {question.scoringStrategy === "partial"
                  ? `Q${questionNumber}:`
                  : `#${questionNumber}:`}
              </Label>
              <div className="flex items-center gap-6">
                <Select
                  value={selectedItemId || ""}
                  onValueChange={(value) =>
                    handleItemSelection(value, subQuestion.subId)
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 w-[200px]",
                      isCorrect && "border-green-500 bg-green-50",
                      isIncorrect && "border-red-500 bg-red-50",
                    )}
                  >
                    <SelectValue
                      placeholder={
                        showCorrectAnswer ? "Not answered" : "Select an item"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {question.items.map((item, itemIndex) => (
                      <SelectItem key={item.id} value={item.id}>
                        {String.fromCharCode(65 + itemIndex)}. {item.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showCorrectAnswer && isIncorrect && subQuestion.item && (
                  <div className="text-sm text-green-600">
                    ✓ {correctAnswerLabel} . {correctAnswer}
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
