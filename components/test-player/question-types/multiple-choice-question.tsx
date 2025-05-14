"use client";
import React from "react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import { Label } from "@testComponents/components/ui/label";
import type { MultipleChoiceQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestion;
  value?: string;
  onChange: (value: string, subId: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

export default function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{question.text}</p>
      <RadioGroup
        value={value}
        unselectable="on"
        onValueChange={(value) => {
          if (!readOnly) {
            onChange(value, question.id);
          }
        }}
      >
        <div className="space-y-1">
          {question.options.map((option) => {
            const isCorrect = showCorrectAnswer && option.isCorrect;
            const isSelectedAndIncorrect =
              showCorrectAnswer && value === option.id && !option.isCorrect;
            const isSelected = value === option.id;

            return (
              <div
                key={option.id}
                className={cn(
                  "relative flex items-center space-x-2 px-2 py-1.5 rounded border text-sm",
                  isSelected && "border-primary",
                  !isSelected && "border-input",
                  isCorrect &&
                    showCorrectAnswer &&
                    "border-green-500 bg-green-50",
                  isSelectedAndIncorrect && "border-red-500 bg-red-50",
                  !readOnly && "hover:bg-muted",
                )}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`option-${option.id}`}
                  disabled={readOnly}
                  className={cn(
                    "h-4 w-4",
                    isCorrect && showCorrectAnswer && "text-green-600",
                    isSelectedAndIncorrect && "text-red-600",
                  )}
                />
                <Label
                  htmlFor={`option-${option.id}`}
                  className="flex-grow cursor-pointer py-0.5"
                >
                  {option.text}
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
