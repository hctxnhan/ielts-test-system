"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@testComponents/components/ui/select";
import { Label } from "@testComponents/components/ui/label";
import type { PickFromAListQuestion } from "@testComponents/lib/types";

interface PickFromListQuestionProps {
  question: PickFromAListQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
}

export default function PickFromListQuestionRenderer({
  question,
  value,
  onChange,
}: PickFromListQuestionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (value) {
      setSelectedAnswers(value);
    }
  }, [value]);

  // Handle item selection for a subquestion
  const handleItemSelection = (itemId: string, subQuestionId: string) => {
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

  // Get subquestions from the question
  const subQuestions = question.subQuestions || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-medium mb-3">{question.text}</p>

        {/* Display the list of items */}
        <div className="bg-muted/30 p-4 rounded-md">
          <h4 className="text-sm font-medium mb-2">List of Items:</h4>
          <div className="pl-4">
            {question.items.map((item, index) => (
              <div key={item.id} className="text-sm mb-1">
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>{" "}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Display the subquestions with dropdown selection */}
      <div className="space-y-4 mt-4">
        {subQuestions.map((subQuestion, index) => {
          const questionNumber =
            question.scoringStrategy === "partial"
              ? question.index + index + 1
              : index + 1;

          const selectedItemId = selectedAnswers[subQuestion.subId];

          return (
            <div key={subQuestion.subId} className="flex flex-col gap-2 mb-4">
              <Label className="text-sm">
                {question.scoringStrategy === "partial"
                  ? `Question ${questionNumber}`
                  : `Item ${questionNumber}`}
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedItemId || ""}
                  onValueChange={(value) => {
                    handleItemSelection(value, subQuestion.subId);
                  }}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select an item from the list" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.items.map((item, itemIndex) => (
                      <SelectItem key={item.id} value={item.id}>
                        {String.fromCharCode(65 + itemIndex)}. {item.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
