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
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
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
      // Clear the selection from other sub-questions
      Object.keys(updated).forEach((key) => {
        if (updated[key] === itemId) {
          updated[key] = "";
          onChange(updated, key);
        }
      });
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
    <div className="mx-auto space-y-6">
      <RichTextContent content={question.text || ""} className="text-sm" />
      <div className="grid grid-cols-1 md:grid-cols-[minmax(250px,1fr)_minmax(250px,1fr)] gap-6">
        <div className="space-y-3">
          <p className="text-base font-semibold text-gray-700">List of Items</p>
          <div className="space-y-2">
            {question.items.map((item, index) => (
              <div key={item.id} className="">
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}.{" "}
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-base font-semibold text-gray-700">Questions</p>
          <div className="space-y-4">
            {subQuestions.map((subQuestion, index) => {
              const questionNumber =
                question.scoringStrategy === "partial"
                  ? question.index + index + 1
                  : index + 1;
              const selectedItemId = selectedAnswers[subQuestion.subId];

              // Check if the selected item is ANY of the correct answers
              const isCorrect =
                showCorrectAnswer &&
                selectedItemId &&
                question.subQuestions.some((sq) => sq.item === selectedItemId);

              const isIncorrect = showCorrectAnswer && !isCorrect;

              // Find all correct item IDs from the subQuestions
              const allCorrectItemIds = question.subQuestions.map(
                (sq) => sq.item,
              );

              // Find correct items that aren't currently selected in any field
              const availableCorrectItemIds = allCorrectItemIds.filter(
                (itemId) =>
                  !Object.values(selectedAnswers).includes(itemId ?? "") ||
                  itemId === selectedItemId,
              );

              // Default to showing the original assigned correct answer
              let suggestedCorrectItemId = subQuestion.item || "";
              // If that's already selected somewhere else, suggest another available correct answer
              if (
                availableCorrectItemIds.length > 0 &&
                Object.values(selectedAnswers).includes(
                  subQuestion.item ?? "",
                ) &&
                subQuestion.item !== selectedItemId
              ) {
                suggestedCorrectItemId = availableCorrectItemIds[0] || "";
              }
              const correctAnswerIndex = question.items.findIndex(
                (item) => item.id === suggestedCorrectItemId,
              );
              const correctAnswer =
                question.items[correctAnswerIndex]?.text || "";
              const correctAnswerLabel =
                correctAnswerIndex >= 0
                  ? String.fromCharCode(65 + correctAnswerIndex)
                  : "";

              return (
                <div
                  key={subQuestion.subId}
                  className="flex flex-col justify-center gap-3"
                >
                  <Label className="min-w-[180px] text-gray-700">
                    {question.scoringStrategy === "partial"
                      ? `Question ${questionNumber}.`
                      : `${questionNumber}.`}{" "}
                  </Label>
                  <div className="flex-1 flex-col gap-4 items-center">
                    <div
                      className={cn(
                        "flex-1 rounded-lg transition-colors duration-200",
                        isCorrect && "border-green-500 bg-green-50",
                        isIncorrect && "border-red-500 bg-red-50",
                      )}
                    >
                      <Select
                        value={selectedItemId || ""}
                        onValueChange={(value) =>
                          handleItemSelection(value, subQuestion.subId)
                        }
                        disabled={readOnly}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 w-full border shadow-sm hover:shadow transition-shadow duration-200",
                            isCorrect && "border-green-500",
                            isIncorrect && "border-red-500",
                          )}
                        >
                          <SelectValue
                            placeholder={
                              readOnly ? "Not answered" : "Select an item"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {question.items.map((item, itemIndex) => {
                            // Skip if this item is already selected in another sub-question
                            const isAlreadySelected = false;
                            if (
                              isAlreadySelected &&
                              item.id !== selectedItemId
                            ) {
                              return null;
                            }

                            return (
                              <SelectItem key={item.id} value={item.id}>
                                {String.fromCharCode(65 + itemIndex)}.{" "}
                                {item.text}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    {isIncorrect &&
                      showCorrectAnswer &&
                      suggestedCorrectItemId && (
                        <div className="text-sm flex items-center space-x-2">
                          <span className="text-green-600 whitespace-nowrap">
                            ✓ {correctAnswerLabel}. {correctAnswer}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
