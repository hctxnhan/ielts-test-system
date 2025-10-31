"use client";
import React from "react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import type { MultipleChoiceQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestion;
  value?: string;
  onChange: (value: string, subId: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (
    questionId: string,
    content: string,
    field: "text" | string 
  ) => void;
}

export default function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-2">
      <RichTextEditor
        value={question.text || ""}
        onChange={(content) => onQuestionHighlighted(question.id, content, "text")}
        readonly={true}
        className={cn("leading-relaxed w-full h-full", "cursor-default")}
        minHeight={20}
      />
      <RadioGroup
        value={value}
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
            
            const radioId = `option-${option.id}`;
            const labelId = `label-${option.id}`;

            return (
              <div
                key={option.id}
                className={cn(
                  "relative flex items-start px-3 py-3 space-x-2 rounded text-sm",
                  isSelectedAndIncorrect && "border-red-500 bg-red-50",
                  isCorrect && "border-green-500 bg-green-50"
                )}
              >
                <RadioGroupItem
                  value={option.id}
                  id={radioId}
                  disabled={readOnly}
                  aria-labelledby={labelId}
                  className={cn("h-4 w-4")}
                />
                
                <RichTextEditor
                  id={labelId}
                  value={option.text}
                  onChange={(content) =>
                    onQuestionHighlighted(question.id, content, option.id)
                  }
                  readonly={true}
                  className={cn(
                    "w-full h-full", 
                    "cursor-default",
                    "mcq-option-editor"
                  )}
                  minHeight={20}
                />
              </div>
            );
          })}
        </div>
      </RadioGroup>
      <style jsx global>{`
        .mcq-option-editor .ProseMirror {
          padding: 0 !important;;
     }
        .mcq-option-editor .ProseMirror p {
          margin: 0 !important;;
        }
      `}</style>
    </div>
  );
}